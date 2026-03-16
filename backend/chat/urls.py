from django.urls import path

from chat.views import ThreadListCreateView, ThreadDetailView, MessageListView

app_name = 'chat'

urlpatterns = [
    path('threads/', ThreadListCreateView.as_view(), name='thread-list-create'),
    path('threads/<int:pk>/', ThreadDetailView.as_view(), name='thread-detail'),
    path('threads/<int:thread_id>/messages/', MessageListView.as_view(), name='message-list'),
]
