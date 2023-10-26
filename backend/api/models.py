# from django.conf import settings
# from rest_framework.authtoken.models import Token as DefaultTokenModel

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.conf import settings
from encrypted_model_fields.fields import EncryptedCharField

class CustomUserManager(BaseUserManager):
    def create_user(self, fitbit_id, **extra_fields):
        if not fitbit_id:
            raise ValueError('The Fitbit ID is required')
        
        user = self.model(fitbit_id=fitbit_id, **extra_fields)
        user.save(using=self._db)
        return user

    def create_superuser(self, fitbit_id, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(fitbit_id, **extra_fields)

class User(AbstractBaseUser):
    fitbit_id = models.CharField(max_length=200, primary_key=True)
    access_token = EncryptedCharField(max_length=200)
    expires_in = models.IntegerField()
    refresh_token = EncryptedCharField(max_length=200)
    
    # Add additional fields like is_staff, is_superuser for admin
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'fitbit_id'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.fitbit_id
