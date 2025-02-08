import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  IconButton, 
  Typography, 
  Collapse,
} from '@mui/material';
import { 
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon,
} from '@mui/icons-material';


const mockUserActivities = [
  {
    id: 1,
    user: 'Monica Smith',
    content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    subContent: 'Lorem Ipsum',
    time: '1m ago',
    date: 'Today 5:60 pm - 12.06.2014'
  },
  {
    id: 2,
    user: 'John Angel',
    content: 'There are many variations of passages of Lorem Ipsum available',
    time: '2m ago',
    date: 'Today 2:23 pm - 11.06.2014'
  },
  {
    id: 3,
    user: 'Jesica Ocean',
    content: 'Contrary to popular belief, Lorem Ipsum',
    time: '5m ago',
    date: 'Today 1:00 pm - 08.06.2014'
  },
  {
    id: 4,
    user: 'Monica Jackson',
    content: 'The generated Lorem Ipsum is therefore',
    time: '5m ago',
    date: 'Yesterday 8:48 pm - 10.06.2014'
  },
  {
    id: 5,
    user: 'Anna Legend',
    content: 'All the Lorem Ipsum generators on the Internet tend to repeat',
    time: '5m ago',
    date: 'Yesterday 8:48 pm - 10.06.2014'
  },
  {
    id: 6,
    user: 'Damian Nowak',
    content: 'The standard chunk of Lorem Ipsum used',
    time: '5m ago',
    date: 'Yesterday 8:48 pm - 10.06.2014'
  }
];

const UserActivityFeed = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card sx={{ 
      bgcolor: '#2A2F34', 
      color: 'white',
      maxWidth: '100%',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderRadius: '8px'
    }} className="font-inter">
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>
            User Activity
          </Typography>
        </Box>
        <Box> 
          <IconButton 
            size="small" 
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ color: '#6c757d' }}
          >
            {isExpanded ? <ArrowDownIcon /> : <ArrowUpIcon />}
          </IconButton>
          <IconButton size="small" sx={{ color: '#6c757d' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ 
          maxHeight: '500px', 
          overflow: 'auto', 
          p: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#2A2F34',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#6c757d',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
          fontFamily: 'Poppins !important',
        }}>
          {mockUserActivities.map((activity) => (
            <Box
              key={activity.id}
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.03)'
                },
                borderRadius: '4px',
                mb: 1
              }}
              
            >
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography 
                  component="strong" 
                  sx={{ 
                    color: '#70B6F6',
                    fontWeight: 500
                  }}
                >
                  {activity.user}
                </Typography>
                <Typography 
                  component="small" 
                  sx={{ 
                    color: '#6c757d',
                    fontSize: '0.7rem',
                  }}
                >
                  {activity.time}
                </Typography>
              </Box>
              <Box sx={{ mb: 1, textAlign: 'left' }}>
                <Typography 
                  sx={{ 
                    color: '#A8B6BC',
                    mb: 1
                  }}
                >
                  {activity.content}
                </Typography>
                {activity.subContent && (
                  <Typography 
                    sx={{ 
                      color: '#A8B6BC',
                      fontSize: '0.8rem',
                    }}
                  >
                    {activity.subContent}
                  </Typography>
                )}
              </Box>
              <Typography 
                component='small'
                sx={{ 
                  color: '#6c757d',
                  fontSize: '0.7rem',
                  textAlign: 'left',
                  float: 'left',
                }}
              >
                {activity.date}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Card>
  );
};

export default UserActivityFeed;