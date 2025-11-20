import { useState, useEffect } from 'react';
import { cardsAPI } from '../utils/boardsApi';

const RecommendationsPanel = ({ card, boardId, onCardUpdate, onClose }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRelatedCards, setShowRelatedCards] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [card._id, boardId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await cardsAPI.getRecommendations(boardId, card._id);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDueDate = async (suggestedDate) => {
    try {
      setActionLoading(true);
      const updatedCard = await cardsAPI.updateCard(card._id, {
        dueDate: suggestedDate
      });
      onCardUpdate(updatedCard);
      onClose();
    } catch (err) {
      console.error('Failed to update due date:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveToList = async (listId) => {
    try {
      setActionLoading(true);
      const updatedCard = await cardsAPI.moveCard(card._id, {
        newListId: listId,
        newPosition: 0
      });
      onCardUpdate(updatedCard);
      onClose();
    } catch (err) {
      console.error('Failed to move card:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
          <div className="text-center text-gray-600">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Smart Suggestions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-1">{card.title}</h3>
            {card.description && (
              <p className="text-sm text-gray-600">{card.description}</p>
            )}
          </div>

          {/* Due Date Suggestions */}
          {recommendations?.suggestedDueDates && recommendations.suggestedDueDates.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>📅</span>
                <span>Suggested Due Dates</span>
              </h4>
              <div className="space-y-2">
                {recommendations.suggestedDueDates.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {new Date(suggestion.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Reason: {suggestion.reason}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSetDueDate(suggestion.date)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Set Date
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List Movement Suggestions */}
          {recommendations?.suggestedListMovement && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>➡️</span>
                <span>Suggested Move</span>
              </h4>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800 mb-1">
                      Move to: <span className="text-purple-700">{recommendations.suggestedListMovement.listTitle}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {recommendations.suggestedListMovement.reason}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMoveToList(recommendations.suggestedListMovement.listId)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Move Card
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Related Cards */}
          {recommendations?.relatedCards && recommendations.relatedCards.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>🔗</span>
                <span>Related Cards</span>
              </h4>
              <button
                onClick={() => setShowRelatedCards(!showRelatedCards)}
                className="w-full bg-green-50 border border-green-200 rounded-lg p-3 text-left hover:bg-green-100 transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {recommendations.relatedCards.length} related card{recommendations.relatedCards.length !== 1 ? 's' : ''} found
                  </span>
                  <span className="text-xl">{showRelatedCards ? '▼' : '▶'}</span>
                </div>
              </button>

              {showRelatedCards && (
                <div className="mt-2 space-y-2">
                  {recommendations.relatedCards.map((relatedCard) => (
                    <div
                      key={relatedCard._id}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{relatedCard.title}</div>
                          {relatedCard.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {relatedCard.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          {Math.round(relatedCard.similarity * 100)}% match
                        </div>
                      </div>
                      {relatedCard.list?.title && (
                        <div className="mt-2 text-xs text-gray-500">
                          List: {relatedCard.list.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI-Powered Insights */}
          {recommendations?.aiInsights && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <span>✨</span>
                <span>AI-Powered Insights</span>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Gemini</span>
              </h4>

              {/* AI Due Date Suggestion */}
              {recommendations.aiInsights.dueDateSuggestion?.hasDate && (
                <div className="mb-3 bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-medium text-gray-800 mb-1">📅 AI Due Date Suggestion</div>
                  <div className="text-sm text-gray-700 mb-1">
                    {recommendations.aiInsights.dueDateSuggestion.suggestedDate 
                      ? new Date(recommendations.aiInsights.dueDateSuggestion.suggestedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No specific date'}
                  </div>
                  <div className="text-xs text-gray-600">{recommendations.aiInsights.dueDateSuggestion.reason}</div>
                </div>
              )}

              {/* AI List Movement */}
              {recommendations.aiInsights.listMovement?.shouldMove && (
                <div className="mb-3 bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-medium text-gray-800 mb-1">🎯 AI List Suggestion</div>
                  <div className="text-sm text-gray-700 mb-1">Move to: <strong>{recommendations.aiInsights.listMovement.suggestedList}</strong></div>
                  <div className="text-xs text-gray-600">{recommendations.aiInsights.listMovement.reason}</div>
                </div>
              )}

              {/* AI Insights */}
              {recommendations.aiInsights.insights && (
                <div className="space-y-2">
                  {recommendations.aiInsights.insights.priority && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">Priority:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        recommendations.aiInsights.insights.priority === 'high' ? 'bg-red-100 text-red-700' :
                        recommendations.aiInsights.insights.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {recommendations.aiInsights.insights.priority.toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {recommendations.aiInsights.insights.estimatedEffort && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Estimated Effort:</span>
                      <span className="ml-2 text-gray-600">{recommendations.aiInsights.insights.estimatedEffort}</span>
                    </div>
                  )}

                  {recommendations.aiInsights.insights.actionableSteps?.length > 0 && (
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-1">Suggested Steps:</div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                        {recommendations.aiInsights.insights.actionableSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendations.aiInsights.insights.potentialBlockers?.length > 0 && (
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-1">⚠️ Potential Blockers:</div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                        {recommendations.aiInsights.insights.potentialBlockers.map((blocker, idx) => (
                          <li key={idx}>{blocker}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Smart Tips (Fallback) */}
          {recommendations?.smartTips && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <span>💡</span>
                <span>Smart Tips to Get Better Suggestions</span>
              </h4>
              <div className="space-y-3">
                {recommendations.smartTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                    <span className="text-2xl">{tip.icon}</span>
                    <p className="text-sm text-gray-700">{tip.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Recommendations */}
          {!recommendations?.suggestedDueDates?.length &&
           !recommendations?.suggestedListMovement &&
           !recommendations?.relatedCards?.length &&
           !recommendations?.aiInsights &&
           !recommendations?.smartTips && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🤔</div>
              <div className="text-gray-600">No suggestions available for this card yet.</div>
              <div className="text-sm text-gray-500 mt-2">
                Try adding more details or similar cards to get better recommendations.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
