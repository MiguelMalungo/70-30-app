from django.urls import path

from . import views

app_name = 'notifications'

urlpatterns = [
    path('subscribe/', views.SubscribePushView.as_view(), name='subscribe'),
    path('unsubscribe/', views.UnsubscribePushView.as_view(), name='unsubscribe'),
    path('list/', views.NotificationListView.as_view(), name='list'),
    path('mark-read/', views.NotificationMarkReadView.as_view(), name='mark-read'),
    path('send/', views.SendPushView.as_view(), name='send'),
]
