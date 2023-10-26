from django.urls import path
from . import views

urlpatterns = [
    path('data/',views.getData),
    path('exchangetoken/', views.login),
    path('download-data/', views.downloadData),
    path('logout/', views.logout)
]