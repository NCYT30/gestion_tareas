"""gestion_tareas URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.login_user, name = 'login_user'),
    path('user_login', views.user_login, name = 'user_login'),
    path('register/', views.register, name = 'register'),
    path('user_register/', views.user_register, name = 'user_register'),
    path('gestion_tareas/', views.gestion_tareas, name = 'gestion_tareas'),
    path('listado_tareas/', views.listado_tareas, name = 'listado_tareas'),
    path('crear_tareas/', views.crear_tareas, name = 'crear_tareas'),
    path('crear_una_tarea/', views.crear_una_tarea, name = 'crear_una_tarea'),
    path('update-task/<int:task_id>/', views.update_task, name = 'update_task'),
    path('tareas/completar/<int:id>/', views.completar_tarea, name = 'completar_tarea'),
    path('editar/tarea/completa/<int:task_id>/', views.editar_tarea_completa, name = 'editar_tarea_completa'),
    path('eliminar/<int:task_id>/', views.eliminar_tarea_completa, name='eliminar_tarea'),
    path('eliminar/tarea/<int:task_id>/', views.eliminar_tarea, name='eliminar_tarea_una'),
    path('update-task-status/', views.update_task_status, name = 'update_task_status'),
    path('filtrar-tareas/', views.filtrar_tareas, name = 'filtrar_tareas'),
    path('alta_prioridad/', views.alta_prioridad, name = 'alta_prioridad'),
    path('categoria/', views.categoria, name = 'categoria'),
    path('category/delete/<int:pk>/', views.delete_category, name='delete_category'),
    path('category/update/<int:pk>/', views.update_category, name='update_category'),
    path('progreso/', views.progreso, name = 'progreso'),
    path('completadas/', views.completadas, name = 'completadas'),

]
