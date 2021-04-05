import React from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const AlertSmall = (iconText: any, titleText: {} | null | undefined) => {
    const MySwal = withReactContent(Swal)
    return (
        MySwal.fire({
            toast: true,
            position: 'bottom-end',
            icon: iconText,
            title: <p>{titleText}</p>,
            timerProgressBar: true,
            timer: 5000
         })
    )
 }

export default AlertSmall