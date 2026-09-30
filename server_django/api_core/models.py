from django.db import models

class Event(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=255)
    date = models.CharField(max_length=100)
    time = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    image = models.TextField()
    category = models.CharField(max_length=100)
    status = models.CharField(max_length=100, default='Upcoming')
    regLink = models.CharField(max_length=500, blank=True, null=True)
    createdAt = models.CharField(max_length=100)
    updatedAt = models.CharField(max_length=100)

    class Meta:
        db_table = 'events'
        ordering = ['-createdAt']

    def __str__(self):
        return self.title


class SiteConfig(models.Model):
    key = models.CharField(max_length=100, primary_key=True)
    value = models.JSONField(default=dict)
    updatedAt = models.CharField(max_length=100)

    class Meta:
        db_table = 'site_configs'

    def __str__(self):
        return self.key


class ContactMessage(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    createdAt = models.CharField(max_length=100)

    class Meta:
        db_table = 'messages'
        ordering = ['-createdAt']

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"
