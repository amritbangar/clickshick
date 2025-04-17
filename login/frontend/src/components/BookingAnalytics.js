import React, { useState, useEffect } from 'react';

/**
 * BookingAnalytics component
 * Displays analytics about bookings, especially pin code distribution
 */
const BookingAnalytics = ({ bookings, onPinCodeSelect }) => {
  const [pinCodeStats, setPinCodeStats] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [filterActive, setFilterActive] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  useEffect(() => {
    // Calculate pin code statistics when bookings change
    calculatePinCodeStats();
  }, [bookings]);
  
  const calculatePinCodeStats = () => {
    if (!bookings || bookings.length === 0) {
      setPinCodeStats([]);
      setTotalBookings(0);
      return;
    }
    
    setTotalBookings(bookings.length);
    
    // Count bookings by pin code
    const pinCodeMap = {};
    bookings.forEach(booking => {
      const pinCode = booking.pinCode || 'unknown';
      if (pinCodeMap[pinCode]) {
        pinCodeMap[pinCode].count++;
      } else {
        pinCodeMap[pinCode] = {
          pinCode: pinCode,
          area: booking.location || 'Unknown Area',
          count: 1
        };
      }
    });
    
    // Convert to array and sort by count
    const statsList = Object.values(pinCodeMap).sort((a, b) => b.count - a.count);
    setPinCodeStats(statsList);
  };
  
  // Calculate percentage of total bookings
  const getPercentage = (count) => {
    if (totalBookings === 0) return 0;
    return Math.round((count / totalBookings) * 100);
  };
  
  // Handle pin code click
  const handlePinCodeClick = (pinCode) => {
    if (pinCode === 'unknown') return;
    
    if (onPinCodeSelect && typeof onPinCodeSelect === 'function') {
      onPinCodeSelect(pinCode);
    }
  };
  
  // Export pin code statistics to HTML report
  const exportHTMLReport = () => {
    // Fetch the report template
    fetch('/report-template.html')
      .then(response => response.text())
      .then(template => {
        // Prepare the data for the report
        const reportData = {
          totalBookings,
          pinCodeStats,
          generatedDate: new Date().toLocaleString()
        };
        
        // Inject the data into the template
        let htmlReport = template.replace(
          'const reportData = {\n      totalBookings: 0,\n      pinCodeStats: []\n      // Will be populated with real data during export\n    };',
          `const reportData = ${JSON.stringify(reportData, null, 6)};`
        );
        
        // Create a blob from the HTML
        const blob = new Blob([htmlReport], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create a link and trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = `pin-code-report-${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      })
      .catch(error => {
        console.error('Error exporting HTML report:', error);
        alert('Failed to export report. Please try again later.');
      });
  };

  // Export pin code statistics to CSV
  const exportCSV = () => {
    try {
      // Create CSV header
      let csvContent = "Pin Code,Area,Booking Count,Percentage\n";
      
      // Add data rows
      pinCodeStats.forEach(stat => {
        const percentage = getPercentage(stat.count);
        // Escape commas in area names
        const escapedArea = stat.area.includes(',') ? `"${stat.area}"` : stat.area;
        csvContent += `${stat.pinCode},${escapedArea},${stat.count},${percentage}%\n`;
      });
      
      // Add summary row
      csvContent += `\nTotal Bookings,${totalBookings}`;
      
      // Create a blob from the CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `pin-code-stats-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again later.');
    }
  };

  // Export pin code statistics to Excel (XLSX format via downloadable CSV)
  const exportExcel = () => {
    try {
      // For Excel-compatible CSV
      let csvContent = "Pin Code,Area,Booking Count,Percentage\n";
      
      // Add data rows formatted for Excel
      pinCodeStats.forEach(stat => {
        const percentage = getPercentage(stat.count);
        // Escape commas in area names
        const escapedArea = stat.area.includes(',') ? `"${stat.area}"` : stat.area;
        csvContent += `${stat.pinCode},${escapedArea},${stat.count},${percentage}%\n`;
      });
      
      // Add summary row
      csvContent += `\nTotal Bookings,${totalBookings}`;
      
      // Create a blob with BOM (Byte Order Mark) for Excel compatibility
      const BOM = "\uFEFF"; // UTF-8 BOM
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `pin-code-stats-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel file. Please try again later.');
    }
  };
  
  // Toggle export options dropdown
  const toggleExportOptions = () => {
    setShowExportOptions(!showExportOptions);
  };

  // Close export options when clicked outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowExportOptions(false);
    };
    
    if (showExportOptions) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showExportOptions]);
  
  if (!bookings || bookings.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2"></i>
        No booking data available for analysis
      </div>
    );
  }
  
  return (
    <div className="booking-analytics">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Booking Distribution by Pin Code</h5>
        <div className="dropdown" onClick={(e) => e.stopPropagation()}>
          <button 
            className="btn btn-sm btn-primary dropdown-toggle" 
            onClick={toggleExportOptions}
            aria-expanded={showExportOptions}
          >
            <i className="fas fa-file-export me-1"></i>
            Export
          </button>
          {showExportOptions && (
            <div className="dropdown-menu dropdown-menu-end show">
              <button className="dropdown-item" onClick={exportHTMLReport}>
                <i className="fas fa-file-code me-2"></i>
                HTML Report
              </button>
              <button className="dropdown-item" onClick={exportCSV}>
                <i className="fas fa-file-csv me-2"></i>
                CSV File
              </button>
              <button className="dropdown-item" onClick={exportExcel}>
                <i className="fas fa-file-excel me-2"></i>
                Excel File
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table table-sm table-hover">
          <thead className="table-light">
            <tr>
              <th>Pin Code</th>
              <th>Area</th>
              <th>Bookings</th>
              <th>Percentage</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pinCodeStats.map((stat) => (
              <tr key={stat.pinCode}>
                <td>
                  <span className="fw-bold">{stat.pinCode}</span>
                </td>
                <td>{stat.area}</td>
                <td>
                  <span className="badge bg-primary">{stat.count}</span>
                </td>
                <td>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${getPercentage(stat.count)}%` }}
                      aria-valuenow={getPercentage(stat.count)} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <span className="small">{getPercentage(stat.count)}%</span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline-primary py-0 px-2"
                    onClick={() => handlePinCodeClick(stat.pinCode)}
                    disabled={stat.pinCode === 'unknown'}
                  >
                    <i className="fas fa-filter me-1"></i>
                    Filter
                  </button>
                </td>
              </tr>
            ))}
            {pinCodeStats.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="alert alert-light border small">
        <i className="fas fa-lightbulb me-2 text-warning"></i>
        <strong>Tip:</strong> Click on a pin code's "Filter" button to apply it as a filter.
      </div>
    </div>
  );
};

export default BookingAnalytics; 