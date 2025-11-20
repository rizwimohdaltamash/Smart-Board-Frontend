import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { boardsAPI, listsAPI, cardsAPI } from '../utils/boardsApi';
import { QRCodeSVG } from 'qrcode.react';
import CreateListModal from '../components/CreateListModal';
import CreateCardModal from '../components/CreateCardModal';
import RecommendationsPanel from '../components/RecommendationsPanel';
import { useAuth } from '../context/AuthContext';

const Board = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showListModal, setShowListModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const [boardData, listsData, cardsData] = await Promise.all([
        boardsAPI.getBoard(boardId),
        listsAPI.getBoardLists(boardId),
        cardsAPI.getBoardCards(boardId)
      ]);
      
      setBoard(boardData);
      setLists(listsData);
      setCards(cardsData);
    } catch (err) {
      setError(err.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const getCardsByList = (listId) => {
    return cards.filter(card => card.list === listId || card.list._id === listId)
      .sort((a, b) => a.position - b.position);
  };

  const handleCreateList = async (listData) => {
    try {
      const newList = await listsAPI.createList(listData);
      setLists([...lists, newList]);
      setShowListModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleCreateCard = async (cardData) => {
    try {
      const newCard = await cardsAPI.createCard(cardData);
      setCards([...cards, newCard]);
      setShowCardModal(false);
      setSelectedListId(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;

    // Dropped outside valid droppable
    if (!destination) return;

    // No movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === 'list') {
      // Reorder lists
      const newLists = Array.from(lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);
      
      setLists(newLists);
      
      // Update positions on server
      // Optional: implement list reordering API call
    } else if (type === 'card') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;

      if (sourceListId === destListId) {
        // Reorder within same list
        const listCards = getCardsByList(sourceListId);
        const newCards = Array.from(listCards);
        const [removed] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, removed);

        // Update local state
        const updatedCards = cards.map(card => {
          const cardInList = newCards.find(c => c._id === card._id);
          if (cardInList) {
            const newPosition = newCards.indexOf(cardInList);
            return { ...card, position: newPosition };
          }
          return card;
        });
        
        setCards(updatedCards);
      } else {
        // Move to different list
        const movedCard = cards.find(c => c._id === result.draggableId);
        
        if (movedCard) {
          try {
            await cardsAPI.moveCard(movedCard._id, {
              listId: destListId,
              position: destination.index
            });
            
            // Update local state
            const updatedCards = cards.map(card => 
              card._id === movedCard._id 
                ? { ...card, list: destListId, position: destination.index }
                : card
            );
            setCards(updatedCards);
          } catch (err) {
            console.error('Failed to move card:', err);
          }
        }
      }
    }
  };

  const openAddCardModal = (listId) => {
    setSelectedListId(listId);
    setShowCardModal(true);
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviteLoading(true);
      setInviteMessage('');
      await boardsAPI.inviteUser(boardId, inviteEmail);
      setInviteMessage('Invitation sent successfully!');
      setInviteEmail('');
      
      // Refresh board data to update members list
      const boardData = await boardsAPI.getBoard(boardId);
      setBoard(boardData);
      
      setTimeout(() => setInviteMessage(''), 3000);
    } catch (err) {
      setInviteMessage(err.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const openRecommendations = (card) => {
    setSelectedCard(card);
    setShowRecommendations(true);
  };

  const handleCardUpdate = (updatedCard) => {
    setCards(cards.map(c => c._id === updatedCard._id ? updatedCard : c));
  };

  const handleShare = () => {
    const link = `${window.location.origin}/board/${boardId}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join my board: ${board?.title}`);
    const body = encodeURIComponent(`Hi!\n\nI'd like to invite you to collaborate on my board "${board?.title}".\n\nClick here to join: ${shareLink}\n\nLet's work together!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Join my board "${board?.title}" and let's collaborate!\n\n${shareLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent(`Join my board: ${board?.title}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${text}`, '_blank');
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Check out my board: ${board?.title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareLink)}`, '_blank');
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `board-${boardId}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
        <button
          onClick={() => navigate('/boards')}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Back to Boards
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/boards')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Boards</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{board?.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>

          {/* Members Button */}
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{board?.members.length}</span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
            >
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-red-600 font-medium transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Invite Message */}
      {inviteMessage && (
        <div className={`mx-6 mt-4 p-3 rounded-lg text-sm font-medium ${
          inviteMessage.includes('success') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {inviteMessage}
        </div>
      )}

      {/* Members Panel */}
      {showMembers && (
        <div className="mx-6 mt-4 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Board Members</h3>
            <button
              onClick={() => setShowMembers(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            {board?.members.map((member) => {
              const user = member.user || member;
              return (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {board?.owner === user._id && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                        Owner
                      </span>
                    )}
                    {member.role === 'admin' && board?.owner !== user._id && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div 
                className="flex gap-4 items-start min-h-[calc(100vh-140px)]"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {lists.map((list, index) => (
                  <Draggable key={list._id} draggableId={list._id} index={index}>
                    {(provided) => (
                      <div 
                        className="bg-white rounded-lg min-w-[300px] max-w-[300px] flex flex-col max-h-[calc(100vh-140px)] shadow-sm border border-gray-200"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div 
                          className="px-4 py-3 flex justify-between items-center cursor-grab active:cursor-grabbing border-b border-gray-200"
                          {...provided.dragHandleProps}
                        >
                          <h2 className="text-base font-semibold text-gray-900">{list.title}</h2>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                            {getCardsByList(list._id).length}
                          </span>
                        </div>
                        
                        <Droppable droppableId={list._id} type="card">
                          {(provided, snapshot) => (
                            <div 
                              className={`px-3 py-2 overflow-y-auto flex-1 flex flex-col gap-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {getCardsByList(list._id).map((card, cardIndex) => (
                                <Draggable 
                                  key={card._id} 
                                  draggableId={card._id} 
                                  index={cardIndex}
                                >
                                  {(provided, snapshot) => (
                                    <div 
                                      className={`bg-gradient-to-br from-blue-50 to-white p-3 rounded-lg shadow-sm hover:shadow-md transition group border-l-4 border-blue-400 ${
                                        snapshot.isDragging ? 'opacity-90 rotate-2 shadow-xl bg-gradient-to-br from-blue-100 to-blue-50 scale-105' : ''
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <div {...provided.dragHandleProps}>
                                        <h3 className="text-sm font-semibold text-blue-700 mb-1">{card.title}</h3>
                                        {card.description && (
                                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{card.description}</p>
                                        )}
                                        {card.dueDate && (
                                          <div className="text-xs text-gray-600 mt-2">
                                            Due: {new Date(card.dueDate).toLocaleDateString()}
                                          </div>
                                        )}
                                        {card.labels && card.labels.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {card.labels.map((label, idx) => (
                                              <span key={idx} className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                                                {label}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Recommendations Button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openRecommendations(card);
                                        }}
                                        className="mt-2 w-full py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100 transition opacity-0 group-hover:opacity-100"
                                      >
                                        Get Suggestions
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <button 
                          className="mx-3 my-2 p-2 text-gray-600 text-left rounded-md hover:bg-gray-100 font-medium transition text-sm"
                          onClick={() => openAddCardModal(list._id)}
                        >
                          + Add a card
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                <button 
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg min-w-[300px] font-medium transition border border-gray-200 shadow-sm"
                  onClick={() => setShowListModal(true)}
                >
                  + Add another list
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {showListModal && (
        <CreateListModal
          onClose={() => setShowListModal(false)}
          onCreate={handleCreateList}
          boardId={boardId}
          position={lists.length}
        />
      )}

      {showCardModal && (
        <CreateCardModal
          onClose={() => {
            setShowCardModal(false);
            setSelectedListId(null);
          }}
          onCreate={handleCreateCard}
          listId={selectedListId}
          boardId={boardId}
          position={getCardsByList(selectedListId).length}
        />
      )}

      {showRecommendations && selectedCard && (
        <RecommendationsPanel
          card={selectedCard}
          boardId={boardId}
          onCardUpdate={handleCardUpdate}
          onClose={() => {
            setShowRecommendations(false);
            setSelectedCard(null);
          }}
        />
      )}

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Share Board</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Link and Share Options */}
              <div>
                <p className="text-gray-600 mb-3 text-sm font-medium">Share via link:</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                  <code className="text-xs text-gray-700 break-all">{shareLink}</code>
                </div>

                <button
                  onClick={copyShareLink}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Link</span>
                </button>

                <p className="text-gray-600 mb-3 text-sm font-medium">Share via platforms:</p>
                <div className="space-y-2">
                  <button
                    onClick={shareViaEmail}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Share via Email</span>
                  </button>

                  <button
                    onClick={shareViaWhatsApp}
                    className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>Share via WhatsApp</span>
                  </button>

                  <button
                    onClick={shareViaTelegram}
                    className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span>Share via Telegram</span>
                  </button>

                  <button
                    onClick={shareViaTwitter}
                    className="w-full bg-sky-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-sky-600 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span>Share via Twitter</span>
                  </button>
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="flex flex-col items-center">
                <p className="text-gray-600 mb-3 text-sm font-medium">Scan QR Code:</p>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={shareLink} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <button
                  onClick={downloadQRCode}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download QR Code</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Users can scan this QR code with their phone camera to access the board instantly
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <p className="text-xs text-gray-500 text-center">
                Anyone with this link can view and collaborate on this board
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
