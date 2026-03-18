from django.shortcuts import render
from .models import Booking
from rest_framework import generics
from rest_framework.views import APIView
from .serializers import BookingSerializer,CustomerBookingSerializer,ProviderBookingSerializer,BookingStartSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Payment
from dotenv import load_dotenv
from django.db import transaction
from .utils import generate_otp
from .permissions import IsProviderOfService,IsCustomerOfBooking,isBookingMember
from django.shortcuts import get_object_or_404
import razorpay
import os
from .tasks import send_booking_confirm

load_dotenv()

# Create your views here.


class BookingListView(generics.ListCreateAPIView):
    serializer_class=BookingSerializer
    permission_classes=[IsAuthenticated]

    def perform_create(self, serializer):
        service=serializer.validated_data.get('service')
        return serializer.save(customer=self.request.user,amount=service.price)
    
    def get_queryset(self):
     user=self.request.user
     if user.role == 'customer':
            return Booking.objects.filter(customer=user)
     
     return Booking.objects.filter(service__provider=user)
    
    def create(self, request, *args, **kwargs):
        if request.user.role == 'provider':
            return Response({"message": "Providers cannot book services!"}, status=status.HTTP_400_BAD_REQUEST)
        
        service_id=request.data.get('service')
        
        if Booking.objects.filter(customer=request.user, service=service_id, status='pending').exists():
            return Response({"message": "You already have a pending booking for this service."}, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)

class BookingRetreiveView(generics.RetrieveAPIView):

    permission_classes=[IsAuthenticated,isBookingMember]
    def get_serializer_class(self):
            if self.request.user.role=='customer' :
                return CustomerBookingSerializer
           
            return ProviderBookingSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Booking.objects.select_related('service', 'service__provider').filter(customer=user)
        
        if user.role == 'provider':
            return Booking.objects.select_related('service','customer', 'service__provider').filter(service__provider=user)
        
        return Booking.objects.none()  
           
class BookingConfirmView(APIView):

    permission_classes=[IsAuthenticated,IsProviderOfService]
    def post(self,request,booking_id):
        booking=get_object_or_404(Booking,pk=booking_id)
        self.check_object_permissions(request, booking)
        
        if booking.status != 'pending':
            return Response(
                {"message": f"Cannot confirm. Booking is already {booking.status}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        otp=generate_otp()

        with transaction.atomic():
            booking.status='confirmed'
            booking.arrival_otp=otp
            booking.save()
            send_booking_confirm.delay_on_commit(booking.id)
        


        return Response({
            "message": "Booking confirmed successfully",
            "arrival_otp": otp
        }, status=status.HTTP_200_OK)

class BookingStartView(APIView):
    permission_classes=[IsAuthenticated,IsProviderOfService]
    def post(self,request,booking_id):
        booking = get_object_or_404(Booking, pk=booking_id)

        self.check_object_permissions(request, booking)

        serializer=BookingStartSerializer(data=request.data)

        if serializer.is_valid():

            if booking.arrival_otp != serializer.validated_data['arrival_otp']:
                return Response({"message": "Invalid OTP!"}, status=400)
            
            if booking.status != 'confirmed':
                return Response({"message": "Booking not confirmed yet!"}, status=400)
           
            with transaction.atomic():
                booking.status = 'started'
                booking.arrival_otp = None
                new_otp = generate_otp()
                booking.completion_otp = new_otp
                booking.save()
            
                return Response({"message": "Service Started", "otp": new_otp}, status=200)

        return Response(serializer.errors, status=400)
    
class BookingCancelView(APIView):
    permission_classes = [IsAuthenticated, isBookingMember]
    
    def post(self, request, booking_id):
       
        booking = get_object_or_404(Booking, pk=booking_id)
       
        self.check_object_permissions(request, booking)
        
        if booking.status not in ['pending', 'confirmed']:
            return Response(
                {"message": f"Cannot cancel booking in {booking.status} state."},
                status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'cancelled'
        booking.save()
        return Response({"message": "Booking cancelled successfully"}, status=status.HTTP_200_OK)

class BookingCompleteView(APIView):
    permission_classes = [IsAuthenticated, IsProviderOfService]
    
    def post(self, request, booking_id):
       
        booking = get_object_or_404(Booking, pk=booking_id)
     
        self.check_object_permissions(request, booking)

        completion_otp = request.data.get('completion_otp')

        if not completion_otp or booking.completion_otp!= completion_otp:
            print("completion otp",booking.completion_otp)
            return Response({"message": "Invalid Completion OTP"}, status=status.HTTP_400_BAD_REQUEST)

       
        if booking.status != 'started':
            return Response({'message': "Work has not started yet or already finished"}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            booking.status = 'completed'
            booking.completion_otp = None  
            booking.save()

            return Response({
                "message": "Work completed successfully",
                "status": booking.status
            }, status=status.HTTP_200_OK)
    

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated, IsProviderOfService]

    def post(self,request,booking_id):
        
        
        booking = get_object_or_404(Booking.objects.select_related('service'), pk=booking_id)
        self.check_object_permissions(request, booking)

        if booking.is_paid:
            return Response({"message": "Bhai, iska paisa mil chuka hai!"}, status=400)

        if booking.status!='completed':
            return Response({"message":"work has not been completed yet"},status=status.HTTP_400_BAD_REQUEST)
        
        payment_method=request.data.get('payment_method')

        if payment_method=='cash':
            with transaction.atomic():
                booking.payment_method = 'cash'
                booking.is_paid = True
                booking.save()
            return Response({"message": "Payment recorded as Cash"}, status=status.HTTP_200_OK)

        # Guard: ensure Razorpay keys are configured before making any API call
        razorpay_key = os.getenv("RAZORPAY_KEY_ID")
        razorpay_secret = os.getenv("RAZORPAY_KEY_SECRET")
        if not razorpay_key or not razorpay_secret:
            return Response(
                {"error": "Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
                
            existing_payment = Payment.objects.filter(booking=booking).first()
            
            if existing_payment:
                return Response({
                    "order_id": existing_payment.razorpay_order_id,
                    "amount": existing_payment.amount,
                    "currency": 'INR',
                    "key_id": razorpay_key,
                }, status=200)

            service_price=booking.service.price
            razorpay_client=razorpay.Client(auth=(razorpay_key, razorpay_secret))

            razorpay_order=razorpay_client.order.create(
                    {
                        "amount":int(service_price*100),
                        "currency":'INR',
                        "receipt":f"temp_receipt_{request.user.id}"
                    }
                )

            if not razorpay_order:
                return Response({"error": "Razorpay order generation failed"}, status=500)
            
            with transaction.atomic():
                  Payment.objects.create(booking=booking,amount=booking.service.price,razorpay_order_id=razorpay_order['id'])

            return Response(
                    {
                        "order_id": razorpay_order.get("id"),
                        "amount": service_price,
                        "currency": 'INR',
                        "key_id": razorpay_key,
                    },
                    status=status.HTTP_201_CREATED,
                )


        except Exception as e:
                print(e)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
          
class VerifyPaymentView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self, request,booking_id):
        razorpay_payment_id = request.data.get("razorpay_payment_id")

        razorpay_order_id = request.data.get("razorpay_order_id")

        razorpay_signature = request.data.get("razorpay_signature")
        
        razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

        try:
            # Verify the payment signature
            params_dict = {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }

            razorpay_client.utility.verify_payment_signature(params_dict)

            with transaction.atomic():
            
                payment=Payment.objects.select_for_update().get(razorpay_order_id=razorpay_order_id)
        
                payment.razorpay_payment_id=razorpay_payment_id
                payment.razorpay_signature=razorpay_signature
                payment.status='success'
                payment.save()

                booking=Booking.objects.select_for_update().get(pk=booking_id)
                booking.is_paid=True
                booking.payment_method = 'online'
                booking.save()

                return Response(
                    {"status": "success", "message": "Payment verified successfully."}, status=status.HTTP_200_OK
                )

        except Exception as e:
           
            print(f"Payment Verification Error: {str(e)}")
            return Response(
                {"status": "failed", "message": "Verification failed. Don't worry, if money is deducted, it will be refunded."}, 
                status=status.HTTP_400_BAD_REQUEST
            )


    


        
