from rest_framework import permissions

from polyclinic.models import User


class CommentOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        return super().has_permission(request, view) and request.user == comment.user


class IsPatient(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role==User.Role.PATIENT


class IsDoctor(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role==User.Role.DOCTOR

class IsStaff(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return (super().has_permission(request, view) and request.user.role in [User.Role.NURSE,User.Role.DOCTOR])

class IsNurse(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return (super().has_permission(request, view) and request.user.role == User.Role.NURSE)

class IsAppointmentOwner(permissions.IsAuthenticated):
    def has_permission(self, request, view, Appointment):
        return (
            super().has_permission(request, view) and
            ((request.user == Appointment.patient) or (request.user == Appointment.doctor))
        )

class IsDoctorAndAppointmentOwner(IsAppointmentOwner):
    def has_object_permission(self, request, view, Appointment):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.DOCTOR and
                request.user == Appointment.doctor
        )

class IsPatientAndAppointmentOwner(IsAppointmentOwner):
    def has_object_permission(self, request, view, Appointment):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.PATIENT and
                request.user == Appointment.patient
        )

class IsWorkScheduleOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, WorkSchedule):
        return (
            super().has_permission(request, view) and
            request.user == WorkSchedule.staff_profile.user
        )