import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './navigation-component';
import './lost-and-found.css';

// 简单的 Lost & Found 组件
function LostAndFound({ onLogout }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [locations, setLocations] = useState(['All Locations']);
  
  // 新报告的状态
  const [newReport, setNewReport] = useState({
    item_name: '',
    description: '',
    location_found: '',
    date_found: new Date().toISOString().split('T')[0] // 默认为今天
  });

  // 页面加载时获取已有报告
  useEffect(() => {
    fetchExistingReports();
  }, []);
  
  // 搜索和过滤功能
  useEffect(() => {
    const filtered = reports.filter(report => {
      // 搜索条件：物品名称或描述包含搜索词（不区分大小写）
      const matchesSearch = 
        report.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      // 位置过滤条件
      const matchesLocation = 
        locationFilter === 'All Locations' || 
        report.location_found === locationFilter;
        
      return matchesSearch && matchesLocation;
    });
    
    setFilteredReports(filtered);
  }, [searchTerm, locationFilter, reports]);
  
  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 处理位置过滤变化
  const handleLocationFilterChange = (e) => {
    setLocationFilter(e.target.value);
  };

  // 获取已有报告的函数
  const fetchExistingReports = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/lostandfound/reports`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        setFilteredReports(data);
        
        // 提取所有不同的位置并添加"All Locations"选项
        const uniqueLocations = ['All Locations', ...new Set(data.map(item => item.location_found))];
        setLocations(uniqueLocations);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 提交新报告
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReport.item_name || !newReport.description || !newReport.location_found) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/lostandfound/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport)
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const data = await response.json();
      
      // 重置表单
      setNewReport({
        item_name: '',
        description: '',
        location_found: '',
        date_found: new Date().toISOString().split('T')[0]
      });

      // 刷新报告列表
      await fetchExistingReports();
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理登出
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('studentId');
    }
    navigate('/login');
  };

  const studentId = localStorage.getItem('studentId');

  return (
    <div className="lost-and-found-container">
      {/* 顶部蓝色横幅 */}
      <div className="hero-section">
        <Navigation>
          <div className="welcome-container">
            {studentId && (
              <span className="welcome-text">
                Welcome, {studentId}
              </span>
            )}
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </Navigation>
        <div className="hero-content" style={{ marginTop: '20px' }}>
          <div className="wildcat-logo">
            <div className="wildcat-icon">N</div>
          </div>
          <h1 className="hero-title">
            <div className="brand-name-wrapper">
              <span className="brand-name">PurpleWash</span>
            </div>
            <div className="tagline">Campus Community Center</div>
          </h1>
          <p className="hero-subtitle">Report and recover lost items on campus</p>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'center', 
        backgroundColor: '#f5f5f5', 
        padding: '40px 20px',
        marginTop: '80px' // 添加距离顶部的间距
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '30px',
          margin: '0 auto'
        }}>
          {/* 失物招领表单 */}
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--nu-purple)',
            marginBottom: '1.5rem',
            borderBottom: '2px solid var(--nu-purple-30)',
            paddingBottom: '0.75rem'
          }}>Report a Lost Item</h2>
          
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                name="item_name"
                value={newReport.item_name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="What did you find?"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={newReport.description}
                onChange={handleInputChange}
                className="form-input form-textarea"
                placeholder="Color, brand, distinctive features..."
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Location Found *</label>
              <select
                name="location_found"
                value={newReport.location_found}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={isSubmitting}
              >
                <option value="">Select a location</option>
                <option value="Basement">Basement</option>
                <option value="Dorm A">Dorm A</option>
                <option value="Dorm B">Dorm B</option>
                <option value="Community Center">Community Center</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date Found</label>
              <input
                type="date"
                name="date_found"
                value={newReport.date_found}
                onChange={handleInputChange}
                className="form-input"
                max={new Date().toISOString().split('T')[0]}
                disabled={isSubmitting}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
          
          {/* 已有报告列表 */}
          <div className="reports-list">
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--nu-purple)',
              marginBottom: '1.5rem',
              borderBottom: '2px solid var(--nu-purple-30)',
              paddingBottom: '0.75rem'
            }}>Lost & Found Items</h2>
            
            {/* 搜索和过滤控件 */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {/* 搜索输入框 */}
              <div style={{ flex: '1' }}>
                <input 
                  type="text" 
                  placeholder="Search by item name or description..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              
              {/* 位置过滤下拉菜单 */}
              <div>
                <select 
                  value={locationFilter}
                  onChange={handleLocationFilterChange}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  {locations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {filteredReports.length > 0 ? (
              <div style={{
                width: '100%',
                overflowX: 'auto',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.95rem'
                }}>
                  <thead>
                    <tr>
                      <th style={{
                        backgroundColor: 'var(--nu-purple)',
                        color: 'white',
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontWeight: '600'
                      }}>Item</th>
                      <th style={{
                        backgroundColor: 'var(--nu-purple)',
                        color: 'white',
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontWeight: '600'
                      }}>Location</th>
                      <th style={{
                        backgroundColor: 'var(--nu-purple)',
                        color: 'white',
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontWeight: '600'
                      }}>Date</th>
                      {/* 移除Actions列标题 */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id || report._id}>
                        <td style={{
                          padding: '12px 16px',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          <strong>{report.item_name}</strong>
                          <p style={{fontSize: '0.875rem', color: '#4b5563', margin: '5px 0 0'}}>{report.description}</p>
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          borderTop: '1px solid #e5e7eb'
                        }}>{report.location_found}</td>
                        <td style={{
                          padding: '12px 16px',
                          borderTop: '1px solid #e5e7eb'
                        }}>{new Date(report.date_found).toLocaleDateString()}</td>
                        {/* 移除Claim按钮单元格 */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '1rem',
                padding: '40px 0'
              }}>{reports.length > 0 ? 'No matching items found.' : 'No lost items reported yet.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 确保只有一个导出语句
export default LostAndFound;