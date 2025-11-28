from django import forms
from .models import Todo


class TodoForm(forms.ModelForm):
    class Meta:
        model = Todo
        fields = ["title", "description", "due_date", "completed"]
        widgets = {
            "title": forms.TextInput(attrs={"placeholder": "What needs doing?", "class": "input-text"}),
            "description": forms.Textarea(attrs={"placeholder": "Add notes, links, or context", "class": "input-textarea"}),
            "due_date": forms.TextInput(attrs={"type": "text", "class": "date-picker", "placeholder": "Pick a due date"}),
            "completed": forms.CheckboxInput(attrs={"class": "toggle-input"}),
        }
