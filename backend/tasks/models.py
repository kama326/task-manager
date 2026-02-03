from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Task(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('in_progress', 'В работе'),
        ('done', 'Выполнена'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
    ]

    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name='Приоритет')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    due_date = models.DateTimeField(null=True, blank=True, verbose_name='Срок выполнения')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks', verbose_name='Исполнитель')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks', verbose_name='Создатель')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'
        ordering = ['-created_at']
