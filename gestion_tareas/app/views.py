from django.shortcuts import render, redirect
from .models import *
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from django.contrib import messages
from .forms import *
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.utils.dateparse import parse_date
import json
from django.contrib.auth.decorators import login_required
from django.urls import reverse




def login_user(request):
    return render(request, 'login.html')


def user_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            # Autenticamos al usuario
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username = username, password = password)

            if user is not None:
                login(request, user) # Inicia sesion al usuario
                return redirect('gestion_tareas') # Redirige a gestion tareas
            else:
                # Si las credenciales son incorrectas
                form.add_error(None, 'Usuario o contraseña incorrectos')
        else:
            form.add_error(None, 'Por favor, completa todos los campos correctamente')
    
    else:
        form = AuthenticationForm()
    
    return render(request, 'login.html', {'form': form})


def user_register(request):
    if request.method == "POST":
        # Procesamos al formulario
        username = request.POST['username']
        password1 = request.POST['password1']
        password2 = request.POST['password2']

        # Verificamos si las contraseñas coinciden
        if password1 == password2:
            user = User.objects.create_user(username = username, password = password1)
            # Iniciamos sesion despues de registrar al usuario
            login(request, user)
            return redirect('gestion_tareas')
        else:
            # Si las contraseñas no coinciden, mostramos un error
            error_message = "Las contraseñas no coinciden"
            return render(request, 'register.html', {'error_message': error_message})
    
    return render(request, 'register.html')


def register(request):
    return render(request, 'register.html')


@login_required
def gestion_tareas(request):
    # Obtener el usuario actual
    user = request.user

    # Filtrar las tareas del usuario
    tasks = Task.objects.filter(user=user)

    # Contar las tareas por estado
    tareas_pendientes = tasks.filter(status='PENDING').count()
    tareas_completadas = tasks.filter(status='COMPLETED').count()
    alta_prioridad = tasks.filter(priority=3).count()

    # Obtener tareas pendientes ordenadas por fecha límite
    tareas_proximas = tasks.filter(status='PENDING').order_by('due_date')[:5]

    # Pasar los datos al template
    context = {
        'tareas_pendientes': tareas_pendientes,
        'tareas_completadas': tareas_completadas,
        'alta_prioridad': alta_prioridad,
        'tareas_proximas': tareas_proximas,
    }
    return render(request, 'gestion_tareas.html', context)


@login_required
def listado_tareas(request):

    categor = Category.objects.all()

    # Filtrar por estado
    tareas_pendientes = Task.objects.filter(status='PENDING')
    tareas_en_progreso = Task.objects.filter(status='IN_PROGRESS')
    tareas_completadas = Task.objects.filter(status='COMPLETED')

    context = {
        'tareas_pendientes': tareas_pendientes,
        'tareas_en_progreso': tareas_en_progreso,
        'tareas_completadas': tareas_completadas
    }

    categor_context = {'categor': categor}

    return render(request, 'listado_tareas.html', {**context, **categor_context})


@login_required
def crear_tareas(request):
    categor = Category.objects.all()
    usuario = User.objects.all()
    return render(request, 'crear_tareas.html', {'categor': categor, 'usuario': usuario})


@login_required
def crear_una_tarea(request):
    if request.method == "POST":
        title = request.POST['title']
        description = request.POST.get('description', '')
        due_date = request.POST['due_date']
        category_id = request.POST.get('category')
        priority = request.POST['priority']
        status = request.POST['status']
        user_id = request.POST.get('user')

        category = Category.objects.get(id=category_id) if category_id else None
        assigned_user = User.objects.get(id=user_id) if user_id else request.user

        Task.objects.create(
            user=assigned_user,
            title=title,
            description=description,
            due_date=due_date,
            category=category,
            priority=priority,
            status=status
        )
        return redirect('listado_tareas')

    categorias = Category.objects.all()
    usuarios = User.objects.all()
    return render(request, 'crear.html', {'categor': categorias, 'usuarios': usuarios})



@login_required
@csrf_exempt
def update_task(request, task_id):
    if request.method == 'POST':
        try:
            # Parsear los datos recibidos
            data = json.loads(request.body)
            print(f"Datos parseados: {data}")
            
            # Buscar la tarea por su ID
            tarea = Task.objects.get(id=task_id)
            print(f"Tarea encontrada: {tarea}")

            # Actualizar los campos de la tarea
            tarea.title = data.get('title', tarea.title)
            tarea.description = data.get('description', tarea.description)
            tarea.due_date = data.get('due_date', tarea.due_date)
            tarea.save()
            print("Tarea actualizada correctamente")
            
            # Respuesta exitosa
            return JsonResponse({'success': True})
        
        except Task.DoesNotExist:
            print("Error: Tarea no encontrada")
            return JsonResponse({'success': False, 'error': 'Tarea no encontrada'})
        
        except Exception as e:
            print(f"Error inesperado: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)})
    
    # Respuesta para métodos no permitidos
    print("Método no permitido")
    return JsonResponse({'success': False, 'error': 'Método no permitido'})


@login_required
def completar_tarea(request, id):
    if request.method == 'POST':
        tarea = Task.objects.get(id=id)
        tarea.status = 'COMPLETED'
        tarea.save()
        return JsonResponse({'success': True})


@login_required
@csrf_exempt
def editar_tarea_completa(request, task_id):
    if request.method == 'POST':
        try:
            tarea = Task.objects.get(id=task_id)

            # Actualizar los campos
            tarea.title = request.POST.get('title', tarea.title)
            tarea.description = request.POST.get('description', tarea.description)
            tarea.due_date = parse_date(request.POST.get('due_date')) if request.POST.get('due_date') else tarea.due_date
            tarea.priority = int(request.POST.get('priority', tarea.priority))

            # Guardar cambios
            tarea.save()

            # Responder con la tarea actualizada
            return JsonResponse({
                'success': True,
                'tarea': {
                    'id': tarea.id,
                    'title': tarea.title,
                    'description': tarea.description or "Sin descripción",
                    'due_date': tarea.due_date.strftime('%Y-%m-%d') if tarea.due_date else None,
                    'priority': tarea.priority,
                }
            })

        except ObjectDoesNotExist:
            return JsonResponse({'success': False, 'error': 'Tarea no encontrada.'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Método no permitido.'}, status=405)


@login_required
def eliminar_tarea_completa(request, task_id):
    if request.method == 'POST':
        tarea = get_object_or_404(Task, id = task_id)
        tarea.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False}, status=404)


@login_required
def eliminar_tarea(request, task_id):
    if request.method == 'DELETE':  # Cambiado de 'POST' a 'DELETE'
        tarea = get_object_or_404(Task, id=task_id)
        tarea.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False}, status=405)  # 405: Método no permitido


@login_required
@csrf_exempt
def update_task_status(request):
    if request.method == "POST":
        task_id = request.POST.get("id")
        new_status = request.POST.get('estado')
        try:
            task = Task.objects.get(id=task_id)
            task.status = new_status
            task.save()
            return JsonResponse({'success': True, 'message': 'Estado actualizado'})
        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Tarea no encontrada'})
    return JsonResponse({'success': False,'message': 'Metodo no permitido'})


@login_required
def filtrar_tareas(request):
    # Obtener los filtros del request
    categoria = request.GET.get("categoria")
    estado = request.GET.get("estado")
    fecha = request.GET.get("fecha")

    # Filtrar tareas según los valores proporcionados
    tareas = Task.objects.all()
    if categoria:
        tareas = tareas.filter(category_id=categoria)  # Usar 'category_id' para la relación de clave foránea
    if estado:
        tareas = tareas.filter(status=estado)  # Filtrar por el campo 'status'
    if fecha:
        tareas = tareas.filter(due_date=fecha)  # Filtrar por 'due_date'

    # Dividir las tareas según su estado
    tareas_pendientes = tareas.filter(status="PENDING")
    tareas_en_progreso = tareas.filter(status="IN_PROGRESS")
    tareas_completadas = tareas.filter(status="COMPLETED")

    # Renderizar HTML para cada columna
    pending_html = render(request, "partials/tareas_pendientes.html", {"tareas": tareas_pendientes}).content.decode("utf-8")
    in_progress_html = render(request, "partials/tareas_en_progreso.html", {"tareas": tareas_en_progreso}).content.decode("utf-8")
    completed_html = render(request, "partials/tareas_completadas.html", {"tareas": tareas_completadas}).content.decode("utf-8")

    # Responder con JSON, incluyendo los HTML renderizados
    return JsonResponse({
        'pending_html': pending_html,
        'in_progress_html': in_progress_html,
        'completed_html': completed_html  # Corregí el nombre del campo, debe ser 'completed_html'
    })


@login_required
def alta_prioridad(request):
    tareas_altas_prioridad = Task.objects.filter(priority=3)
    print(tareas_altas_prioridad)
    return render(request, 'alta_prioridad.html', {'tareas_altas_prioridad': tareas_altas_prioridad})


@login_required
def categoria(request):
    if request.method == "POST":
        name = request.POST.get('name')
        description = request.POST.get('description', '')

        # Validar si la categoria ya existe
        if Category.objects.create(name=name, description=description):
            messages.error(request, "La categoria ya existe.")
        else:
            Category.objects.create(name=name, description=description)
            messages.success(request, "Categoria creada exitosamente")
        
        return redirect('categoria')
    
    categorias = Category.objects.all()
    return render(request, 'categoria.html', {'categorias': categorias})


# Vista para eliminar una categoría
@login_required
def delete_category(request, pk):
    if request.method == "POST":
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return JsonResponse({"success": True, "message": "Categoría eliminada correctamente."})
    return JsonResponse({"success": False, "message": "Método no permitido."})


# Vista para actualizar una categoría
@login_required
def update_category(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == "POST":
        form = CategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            return JsonResponse({"success": True, "message": "Categoría actualizada correctamente."})
        return JsonResponse({"success": False, "errors": form.errors})
    return JsonResponse({"success": False, "message": "Método no permitido."})


@login_required
def progreso(request):
    tareas_en_progreso = Task.objects.filter(status='IN_PROGRESS')
    return render(request, 'progreso.html', {'tareas_en_progreso': tareas_en_progreso})


@login_required
def completadas(request):
    tareas_completadas = Task.objects.filter(status='COMPLETED')
    return render(request, 'completadas.html', {'tareas_completadas': tareas_completadas})