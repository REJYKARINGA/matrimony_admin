import React from 'react';

const TimeFormatCell = ({ date }) => {
  if (!date) {
    return <span>-</span>;
  }

  try {
    const dateObj = new Date(date);
    
    // Format: 17 Jun 2026 11:45:57 PM
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = hours.toString().padStart(2, '0');
    
    const formattedDate = `${day} ${month} ${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    
    return <span>{formattedDate}</span>;
  } catch (error) {
    return <span>Invalid Date</span>;
  }
};

export default TimeFormatCell;