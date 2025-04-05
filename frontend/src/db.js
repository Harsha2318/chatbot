import Dexie from 'dexie';

export const db = new Dexie('ChatDB');

db.version(1).stores({
  chats: '++id, title, messages'
});

export const createChat = async (title) => {
  const id = await db.chats.add({ title, messages: [] });
  return id;
};

export const saveMessage = async (chatId, role, content) => {
  const chat = await db.chats.get(chatId);
  if (!chat) return;
  chat.messages.push({ role, content });
  await db.chats.put(chat);
};

export const loadChat = async (chatId) => {
  return await db.chats.get(chatId);
};

export const loadChats = async () => {
  return await db.chats.toArray();
};

export const renameChat = async (chatId, newTitle) => {
  await db.chats.update(chatId, { title: newTitle });
};

export const deleteChat = async (chatId) => {
  await db.chats.delete(chatId);
};
