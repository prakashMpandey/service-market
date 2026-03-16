from rest_framework import permissions


class isProvider(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role=='provider'


class isProviderAndOwner(isProvider):
    def has_object_permission(self, request, view, obj):
        return obj.provider==request.user