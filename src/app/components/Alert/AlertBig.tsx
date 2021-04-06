import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const AlertBig = (titleText: any, contentText: any, iconText: any, confirmBText: any) => {
    const MySwal = withReactContent(Swal)
    return (
        MySwal.fire({
            title: titleText,
            text: contentText,
            icon: iconText,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: confirmBText
        })
    )
}

export default AlertBig