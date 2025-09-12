import { useState } from 'react';
import { createPortal } from 'react-dom';
import { generateCoverLetter } from '../services/api';
import '../css/aimodal.css';

function AIModal({ job, onClose }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateCoverLetter = async () => {
    if (!job) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await generateCoverLetter({
        job_title: job.title,
        company: job.company,
        job_description: job.description,
        custom_instruction: customInstruction
      });
      
      setCoverLetter(response.cover_letter || '');
    } catch (err) {
      setError(err.message || 'Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      // You could add a toast notification here
      alert('Cover letter copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy to clipboard');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return createPortal(
    <div
      className='ai-modal-backdrop'
      onClick={onClose}
      role='presentation'
      onKeyDown={handleKeyDown}
    >
      <div
        className='ai-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='ai-modal-title'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='ai-modal-header'>
          <div>
            <h3 id='ai-modal-title' className='ai-modal-title'>
              🤖 AI Cover Letter Generator
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#555' }}>
              {job?.title} at {job?.company}
            </p>
          </div>
          <button 
            onClick={onClose} 
            aria-label='Close AI modal' 
            className='ai-modal-close-btn'
          >
            ✕
          </button>
        </div>
        
        <div className='ai-modal-content'>
          <div className='ai-form-group'>
            <label 
              htmlFor='custom-instruction' 
              className='ai-form-label'
            >
              Custom Instructions (Optional)
            </label>
            <textarea
              id='custom-instruction'
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder='Add any specific instructions for the cover letter (e.g., highlight specific skills, mention particular experiences, tone preferences, etc.)'
              className='ai-form-textarea'
            />
          </div>

          <div className='ai-form-group'>
            <button
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating}
              className='ai-generate-btn'
            >
              {isGenerating ? '⏳' : '🤖'} 
              {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </div>

          {error && (
            <div className='ai-error-message'>
              {error}
            </div>
          )}

          <div className='ai-cover-letter-section'>
            <div className='ai-cover-letter-header'>
              <label 
                htmlFor='cover-letter' 
                className='ai-form-label'
              >
                Generated Cover Letter
              </label>
              {coverLetter && (
                <button
                  onClick={handleCopyToClipboard}
                  className='ai-copy-btn'
                >
                  📋 Copy
                </button>
              )}
            </div>
            <textarea
              id='cover-letter'
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder='Your generated cover letter will appear here...'
              className='ai-cover-letter-textarea'
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AIModal;
