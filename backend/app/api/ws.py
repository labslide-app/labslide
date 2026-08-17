from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter()

# 存储活跃的 WebSocket 连接
active_connections: List[WebSocket] = []


@router.websocket("/notifications")
async def websocket_notifications(websocket: WebSocket):
    """WebSocket 实时通知端点"""
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            # 保持连接并接收客户端消息（心跳检测等）
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        active_connections.remove(websocket)


async def broadcast_notification(message: dict):
    """向所有连接的客户端广播通知"""
    import json
    for connection in active_connections:
        try:
            await connection.send_json(message)
        except Exception:
            active_connections.remove(connection)