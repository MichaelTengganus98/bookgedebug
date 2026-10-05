from django.db import models


class WishlistItem(models.Model):
    volume_id = models.CharField(max_length=64, unique=True)
    title = models.CharField(max_length=500)
    authors = models.JSONField(default=list)
    thumbnail = models.URLField(max_length=1000, blank=True)
    rating = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title