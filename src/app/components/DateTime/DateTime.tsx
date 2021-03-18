import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import QueryBuilder from '@material-ui/icons/QueryBuilder';
import CalendarToday from '@material-ui/icons/CalendarToday';


const DateTime = () => {
   const [dayTime, setDayTime] = useState('')
   const [dayDate, setDayDate] = useState('')

   useEffect(() => {
      updateDate()
      updateTime()

      const interval = setInterval(updateTime, 1000)
      return () => clearInterval(interval)
   }, [])

   const useStyles = makeStyles({
      itemIcon: {
         color: 'white',
         marginRight: '10px',
         marginLeft: '10px'
      },
      center: {
         display: 'flex',
         alignContent: 'center',
         margin: 'auto',
         width: '100%',
         padding: '10px',
         alignItems: 'center'
      }
   });
   const classes = useStyles();

   const updateTime = () => {
      let currentDate = new Date()
      let currentSeconds = currentDate.getSeconds() + ''
      let currentMinutes = currentDate.getMinutes() + ''
      let currentHours = currentDate.getHours() + ''

      if (Number(currentSeconds) == 0 && Number(currentMinutes) == 0 && Number(currentHours) == 0) updateDate()

      if (Number(currentSeconds) < 10) currentSeconds = '0' + currentSeconds
      if (Number(currentMinutes) < 10) currentMinutes = '0' + currentMinutes
      if (Number(currentHours) < 10) currentHours = '0' + currentHours

      setDayTime(currentHours + ':' + currentMinutes + ':' + currentSeconds)
   }

   const updateDate = () => {
      let currentDate = new Date()
      let currentDay = currentDate.getDate() + ''
      let currentMonth = (currentDate.getMonth() + 1) + ''
      let currentYear = currentDate.getFullYear() + ''
      if (Number(currentDay) < 10) currentDay = '0' + currentDay
      if (Number(currentMonth) < 10) currentMonth = '0' + currentMonth

      setDayDate(currentDay + '/' + currentMonth + '/' + currentYear)
   }

   return (
      <div className={classes.center}>
         <QueryBuilder className={classes.itemIcon} /> {dayTime} <CalendarToday className={classes.itemIcon} /> {dayDate}
      </div>
   )
}

export default DateTime
