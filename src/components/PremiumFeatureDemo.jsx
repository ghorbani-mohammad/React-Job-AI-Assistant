import { useState } from 'react';
import { useSubscription } from '../contexts/Subscription';
import { useAuth } from '../contexts/Auth';
import PremiumFeatureGuard, { usePremiumGuard } from './PremiumFeatureGuard';

const PremiumFeatureDemo = () => {
  const { hasPremium, hasFeatureAccess } = useSubscription();
  const { isLoggedIn } = useAuth();
  const [advancedFilters, setAdvancedFilters] = useState({
    salaryRange: '',
    experienceLevel: '',
    remoteWork: false
  });

  // Example of using the premium guard hook
  const { hasAccess: hasAdvancedSearch } = usePremiumGuard('Advanced Job Search Filters');

  const handleAdvancedSearch = () => {
    if (!hasAdvancedSearch) {
      return;
    }
    
    // Perform advanced search logic here
    console.log('Performing advanced search with filters:', advancedFilters);
  };

  return (
    <div className='premium-demo' style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Premium Features Demo</h2>
      
      {/* Status Display */}
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
        <h3>Current Status</h3>
        <p><strong>Logged In:</strong> {isLoggedIn ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Premium Status:</strong> {hasPremium ? '✨ Premium Active' : '🔒 Free Plan'}</p>
        <p><strong>AI Cover Letter Access:</strong> {hasFeatureAccess('AI Cover Letter Generation') ? '✅ Available' : '❌ Requires Premium'}</p>
        <p><strong>Advanced Search Access:</strong> {hasFeatureAccess('Advanced Job Search Filters') ? '✅ Available' : '❌ Requires Premium'}</p>
      </div>

      {/* Advanced Search Filters - Premium Feature */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>🔍 Advanced Job Search Filters</h3>
        <PremiumFeatureGuard feature='Advanced Job Search Filters'>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Salary Range
              </label>
              <select 
                value={advancedFilters.salaryRange} 
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, salaryRange: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value=''>Any</option>
                <option value='0-50k'>$0 - $50k</option>
                <option value='50k-100k'>$50k - $100k</option>
                <option value='100k-150k'>$100k - $150k</option>
                <option value='150k+'>$150k+</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Experience Level
              </label>
              <select 
                value={advancedFilters.experienceLevel} 
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value=''>Any</option>
                <option value='entry'>Entry Level</option>
                <option value='mid'>Mid Level</option>
                <option value='senior'>Senior Level</option>
                <option value='lead'>Lead/Principal</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type='checkbox'
                  checked={advancedFilters.remoteWork}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, remoteWork: e.target.checked }))}
                />
                Remote Work Only
              </label>
            </div>
          </div>
          
          <button 
            onClick={handleAdvancedSearch}
            style={{
              marginTop: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔍 Apply Advanced Filters
          </button>
        </PremiumFeatureGuard>
      </div>

      {/* Resume Analysis - Pro Feature */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>📄 Resume Analysis & Optimization</h3>
        <PremiumFeatureGuard feature='Resume Analysis & Optimization'>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
            <p>Upload your resume for AI-powered analysis and optimization suggestions.</p>
            <input 
              type='file' 
              accept='.pdf,.doc,.docx' 
              style={{ marginBottom: '1rem', display: 'block' }}
            />
            <button 
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📄 Analyze Resume
            </button>
          </div>
        </PremiumFeatureGuard>
      </div>

      {/* Industry Insights - Pro Feature */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>📊 Industry Insights & Analytics</h3>
        <PremiumFeatureGuard feature='Industry Insights & Analytics' requiredPlan='pro'>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
            <p>Get detailed insights about job market trends, salary data, and hiring patterns in your industry.</p>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <div style={{ fontWeight: '600' }}>Market Trends</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <div style={{ fontWeight: '600' }}>Salary Data</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <div style={{ fontWeight: '600' }}>Hiring Patterns</div>
              </div>
            </div>
          </div>
        </PremiumFeatureGuard>
      </div>

      {/* Usage Example in Code */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>💻 Usage Examples</h3>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          <h4>How to use Premium Feature Guard:</h4>
          <pre style={{ background: '#e5e7eb', padding: '0.5rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Wrap any premium feature
<PremiumFeatureGuard feature="AI Cover Letter Generation">
  <YourPremiumComponent />
</PremiumFeatureGuard>

// Use the hook for conditional logic
const { hasAccess } = usePremiumGuard('Advanced Job Search Filters');
if (hasAccess) {
  // Show premium features
}

// Check specific plan requirements
<PremiumFeatureGuard feature="Industry Insights" requiredPlan="pro">
  <ProOnlyFeature />
</PremiumFeatureGuard>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatureDemo;
