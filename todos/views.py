import json

from django.db.models import Max
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.views.decorators.http import require_POST
from .models import Todo
from .forms import TodoForm


def todo_list(request):
    todos = Todo.objects.order_by("position", "-created_at")
    form = TodoForm()

    if request.method == "POST":
        form = TodoForm(request.POST)
        if form.is_valid():
            todo = form.save(commit=False)
            max_position = Todo.objects.aggregate(max_pos=Max("position")).get("max_pos") or 0
            todo.position = max_position + 1
            todo.save()
            return redirect("todo_list")

    context = {
        "todos": todos,
        "form": form,
    }
    return render(request, "home.html", context)


def todo_edit(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == "POST":
        form = TodoForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            return redirect("todo_list")
    else:
        form = TodoForm(instance=todo)

    return render(request, "edit.html", {"form": form, "todo": todo})


def todo_delete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == "POST":
        todo.delete()
        return redirect("todo_list")
    return render(request, "delete_confirm.html", {"todo": todo})


def todo_toggle_complete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.completed = not todo.completed
    todo.save()
    return redirect("todo_list")


@require_POST
def todo_reorder(request):
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")

    order = payload.get("order")
    if not isinstance(order, list):
        return HttpResponseBadRequest("Invalid order format")

    todos = {todo.id: todo for todo in Todo.objects.filter(id__in=order)}

    for idx, todo_id in enumerate(order):
        todo = todos.get(todo_id)
        if todo:
            todo.position = idx

    if todos:
        Todo.objects.bulk_update(todos.values(), ["position"])

    return JsonResponse({"status": "ok"})
