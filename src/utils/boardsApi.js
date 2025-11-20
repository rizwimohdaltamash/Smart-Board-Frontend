import fetchWithAuth from './api';

export const boardsAPI = {
  // Get all user boards
  getBoards: async () => {
    return await fetchWithAuth('/boards');
  },

  // Create new board
  createBoard: async (boardData) => {
    return await fetchWithAuth('/boards', {
      method: 'POST',
      body: JSON.stringify(boardData),
    });
  },

  // Get single board
  getBoard: async (boardId) => {
    return await fetchWithAuth(`/boards/${boardId}`);
  },

  // Update board
  updateBoard: async (boardId, boardData) => {
    return await fetchWithAuth(`/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(boardData),
    });
  },

  // Delete board
  deleteBoard: async (boardId) => {
    return await fetchWithAuth(`/boards/${boardId}`, {
      method: 'DELETE',
    });
  },

  // Invite user to board
  inviteUser: async (boardId, email) => {
    return await fetchWithAuth(`/boards/${boardId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

export const listsAPI = {
  // Get all lists for a board
  getBoardLists: async (boardId) => {
    return await fetchWithAuth(`/lists/board/${boardId}`);
  },

  // Create new list
  createList: async (listData) => {
    return await fetchWithAuth('/lists', {
      method: 'POST',
      body: JSON.stringify(listData),
    });
  },

  // Update list
  updateList: async (listId, listData) => {
    return await fetchWithAuth(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(listData),
    });
  },

  // Delete list
  deleteList: async (listId) => {
    return await fetchWithAuth(`/lists/${listId}`, {
      method: 'DELETE',
    });
  },
};

export const cardsAPI = {
  // Get all cards for a list
  getListCards: async (listId) => {
    return await fetchWithAuth(`/cards/list/${listId}`);
  },

  // Get all cards for a board
  getBoardCards: async (boardId) => {
    return await fetchWithAuth(`/cards/board/${boardId}`);
  },

  // Create new card
  createCard: async (cardData) => {
    return await fetchWithAuth('/cards', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  },

  // Get single card
  getCard: async (cardId) => {
    return await fetchWithAuth(`/cards/${cardId}`);
  },

  // Update card
  updateCard: async (cardId, cardData) => {
    return await fetchWithAuth(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(cardData),
    });
  },

  // Delete card
  deleteCard: async (cardId) => {
    return await fetchWithAuth(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  },

  // Move card
  moveCard: async (cardId, moveData) => {
    return await fetchWithAuth(`/cards/${cardId}/move`, {
      method: 'PUT',
      body: JSON.stringify(moveData),
    });
  },

  // Get card recommendations
  getRecommendations: async (boardId, cardId) => {
    return await fetchWithAuth(`/cards/${cardId}/recommendations`);
  },
};
