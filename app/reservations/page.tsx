import EmptyState from "../components/EmptyState";
import getCurrentUser from "../actions/getCurrentUser";
import getreservations from "../actions/getReservation";
import ReservationsClient from "./ReservationsClient";

const ReservationPage = async ()=>{
    const currentUser = await getCurrentUser()

    if(!currentUser){
        return (
            <EmptyState
            title="Unauthorized"
            subtitle="please login"
            />
        )
    }
    const reservation = await getreservations({
        authorId:currentUser.id
    })
    if(reservation.length===0){
        return (
            <EmptyState
            title="No Reservation Found"
            subtitle="Looks like you have no reservation on your Properties"
            />
        )
    }
    return (
        <ReservationsClient
        reservations={reservation}  
        currentUser={currentUser}
    />
    
    )
}

export default ReservationPage