import { useState } from 'react';

const COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632', '#89609e',
  '#cd5a91', '#4bbf6b', '#00aecc', '#838c91'
];

const CreateBoardModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    background: COLORS[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a board title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onCreate(formData);
    } catch (err) {
      setError(err.message || 'Failed to create board');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Create Board</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Board Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Project Planning"
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Background Color</label>
            <div className="grid grid-cols-5 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`aspect-square border-3 rounded-lg cursor-pointer transition hover:scale-110 text-white font-bold text-xl flex items-center justify-center ${
                    formData.background === color ? 'border-gray-800 scale-105' : 'border-transparent'
                  }`}
                  style={{ background: color }}
                  onClick={() => setFormData({ ...formData, background: color })}
                >
                  {formData.background === color && '✓'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transform transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
