from django.urls import path
from . import views

urlpatterns = [
    path("", views.todo_list, name="todo_list"),
    path("<int:pk>/edit/", views.todo_edit, name="todo_edit"),
    path("<int:pk>/delete/", views.todo_delete, name="todo_delete"),
    path("<int:pk>/toggle/", views.todo_toggle_complete, name="todo_toggle"),
    path("reorder/", views.todo_reorder, name="todo_reorder"),
]
