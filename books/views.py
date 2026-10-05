from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WishlistItem
from .serializers import WishlistItemSerializer
from .services import BookServiceError, search_books


def index(request):
    return render(request, "books/index.html")


class BookSearchView(APIView):
    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response(
                {"detail": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            books = search_books(q)
        except BookServiceError:
            return Response(
                {"detail": "Could not reach Google Books. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        saved = set(WishlistItem.objects.values_list("volume_id", flat=True))
        for book in books:
            book["wishlisted"] = book["id"] in saved
        return Response(books)


class WishlistView(APIView):
    def get(self, request):
        return Response(WishlistItemSerializer(WishlistItem.objects.all(), many=True).data)

    def post(self, request):
        serializer = WishlistItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        item, created = WishlistItem.objects.get_or_create(
            volume_id=data.pop("volume_id"), defaults=data
        )
        return Response(
            WishlistItemSerializer(item).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class WishlistDetailView(APIView):
    def delete(self, request, volume_id):
        WishlistItem.objects.filter(volume_id=volume_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
