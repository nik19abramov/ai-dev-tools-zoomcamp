from django.test import TestCase
from django.urls import reverse
from .models import Todo


class TodoTests(TestCase):
    def test_create_todo(self):
        response = self.client.post(reverse("todo_list"), {
            "title": "Test task",
            "description": "Test description",
            "completed": False,
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), 1)

    def test_toggle_todo(self):
        todo = Todo.objects.create(title="Toggle me")
        self.client.get(reverse("todo_toggle", args=[todo.pk]))
        todo.refresh_from_db()
        self.assertTrue(todo.completed)
