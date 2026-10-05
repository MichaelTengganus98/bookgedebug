from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/books/", views.BookSearchView.as_view(), name="book-search"),
    path("api/wishlist/", views.WishlistView.as_view(), name="wishlist"),
    path(
        "api/wishlist/<str:volume_id>/",
        views.WishlistDetailView.as_view(),
        name="wishlist-detail",
    ),
]
