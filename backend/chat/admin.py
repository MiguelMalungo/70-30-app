from django.contrib import admin

from chat.models import Thread, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['sender', 'text', 'created_at']


@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'created_at', 'updated_at']
    search_fields = ['title']
    filter_horizontal = ['participants']
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'thread', 'sender', 'text_preview', 'created_at']
    list_filter = ['thread']
    search_fields = ['text']
    raw_id_fields = ['thread', 'sender']

    @admin.display(description='Text')
    def text_preview(self, obj):
        return obj.text[:80] if obj.text else ''
