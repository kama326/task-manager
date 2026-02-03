from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'priority', 'assigned_to', 'due_date')
    list_filter = ('status', 'priority', 'assigned_to')
    search_fields = ('title', 'description')
