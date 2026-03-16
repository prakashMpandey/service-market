from rest_framework import permissions

class IsCustomerOfBooking(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.customer == request.user
    
class IsProviderOfService(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.service.provider == request.user
  
class isBookingMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        
        if obj.customer==request.user or obj.service.provider==request.user:
            return True

        else:
            return False