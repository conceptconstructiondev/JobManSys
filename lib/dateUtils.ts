export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A'
  
  let date: Date
  
  if (typeof dateInput === 'string') {
    date = new Date(dateInput)
  } else if (dateInput instanceof Date) {
    date = dateInput
  } else {
    return 'Invalid Date'
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A'
  
  let date: Date
  
  if (typeof dateInput === 'string') {
    date = new Date(dateInput)
  } else if (dateInput instanceof Date) {
    date = dateInput
  } else {
    return 'Invalid Date'
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  const formattedTime = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
  
  return `${formattedDate} ${formattedTime}`
} 