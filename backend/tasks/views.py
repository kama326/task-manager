from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return tasks assigned to the user OR created by the user
        user = self.request.user
        return Task.objects.filter(Q(assigned_to=user) | Q(created_by=user)).distinct()

    @action(detail=False, methods=['post'])
    def bulk_move(self, request):
        from_status = request.data.get('from_status')
        to_status = request.data.get('to_status')
        
        if not from_status or not to_status:
            return Response(
                {"error": "Both 'from_status' and 'to_status' are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        tasks = self.get_queryset().filter(status=from_status)
        count = tasks.update(status=to_status)
        return Response({"message": f"Moved {count} tasks"})

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        target_status = request.data.get('status')
        
        if not target_status:
            return Response(
                {"error": "'status' is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        tasks = self.get_queryset().filter(status=target_status)
        count, _ = tasks.delete()
        return Response({"message": f"Deleted {count} tasks"})
