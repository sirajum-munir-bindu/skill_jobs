from django.db import models

class Ambassador(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    university = models.CharField(max_length=255)
    reason = models.TextField()
    status = models.CharField(max_length=100, default='Pending')
    phone = models.CharField(max_length=100, blank=True, null=True)
    dept = models.CharField(max_length=100, blank=True, null=True)
    year = models.CharField(max_length=100, blank=True, null=True)
    linkedin = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    image = models.TextField(blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)
    createdAt = models.CharField(max_length=100)

    class Meta:
        db_table = 'ambassadors'
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.name or 'Applicant'} - {self.university} ({self.status})"


class WorkReport(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    ambassadorEmail = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    ambassadorName = models.CharField(max_length=255, blank=True, null=True)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    phone = models.CharField(max_length=100)
    institution = models.CharField(max_length=255, default='Campus Member')
    status = models.CharField(max_length=100, default='Pending')
    createdAt = models.CharField(max_length=100)

    class Meta:
        db_table = 'work_reports'
        ordering = ['-createdAt']

    def __str__(self):
        return f"WorkReport: {self.name} by {self.ambassadorEmail}"
