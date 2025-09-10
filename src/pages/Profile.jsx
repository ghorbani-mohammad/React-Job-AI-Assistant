import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/Auth';
import { getProfileDetail, patchProfileDetail } from '../services/auth';
import '../css/profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    cell_number: '',
    email: '',
    about_me: '',
    additional_notes: '',
    education_background: '',
    professional_experience: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getProfileDetail();
        setProfile(profileData);
        setFormData({
          cell_number: profileData.cell_number || '',
          email: profileData.email || '',
          about_me: profileData.about_me || '',
          additional_notes: profileData.additional_notes || '',
          education_background: profileData.education_background || '',
          professional_experience: profileData.professional_experience || '',
        });
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await patchProfileDetail(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      cell_number: profile?.cell_number || '',
      email: profile?.email || '',
      about_me: profile?.about_me || '',
      additional_notes: profile?.additional_notes || '',
      education_background: profile?.education_background || '',
      professional_experience: profile?.professional_experience || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1>Profile</h1>
          <p className="profile-email">{user?.email}</p>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      <div className="profile-sections">
        {/* Contact Information */}
        <div className="profile-section">
          <h2>Contact Information</h2>
          <div className="form-group">
            <label htmlFor="cell_number">Phone Number</label>
            <input
              type="tel"
              id="cell_number"
              name="cell_number"
              value={formData.cell_number}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter your email address"
            />
          </div>
        </div>

        {/* Professional Summary */}
        <div className="profile-section">
          <h2>Professional Summary</h2>
          <div className="form-group">
            <label htmlFor="about_me">About Me</label>
            <textarea
              id="about_me"
              name="about_me"
              value={formData.about_me}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Tell us about yourself, your skills, and what makes you unique..."
              rows="4"
            />
          </div>
          <div className="form-group">
            <label htmlFor="additional_notes">Additional Notes</label>
            <textarea
              id="additional_notes"
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Any additional information you'd like to share..."
              rows="3"
            />
          </div>
        </div>

        {/* Education */}
        <div className="profile-section">
          <h2>Education</h2>
          <div className="form-group">
            <label htmlFor="education_background">Educational Background</label>
            <textarea
              id="education_background"
              name="education_background"
              value={formData.education_background}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="List your educational qualifications, degrees, certifications, etc."
              rows="5"
            />
          </div>
        </div>

        {/* Work History */}
        <div className="profile-section">
          <h2>Work History</h2>
          <div className="form-group">
            <label htmlFor="professional_experience">Professional Experience</label>
            <textarea
              id="professional_experience"
              name="professional_experience"
              value={formData.professional_experience}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Describe your work experience, previous roles, achievements, and career highlights..."
              rows="6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

