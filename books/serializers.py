from rest_framework import serializers

from .models import WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="volume_id", max_length=64)
    authors = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    thumbnail = serializers.CharField(required=False, allow_blank=True, default="")
    rating = serializers.FloatField(required=False, default=0)

    class Meta:
        model = WishlistItem
        fields = ["id", "title", "authors", "thumbnail", "rating"]
