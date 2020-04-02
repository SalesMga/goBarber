import Appointment from '../models/Appointment';
import {startOfHour, parseISO, isBefore} from 'date-fns'
import User from '../models/User';
import * as Yup from 'yup';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Validation fails'});
    }

    const {provider_id , date} = req.body;

    /**
     * Check if provider_id as provider
     */

     const CheckisProvider = await User.findOne({
       where: {id: provider_id, provider: true},
     });

     if(!CheckisProvider){
       return res
       .status(401)
       .json({error: 'You can only create appointments with providers'});
     }

     const hourStart = startOfHour(parseISO(date));

     if(isBefore(hourStart, new Date())){
       return res.status(400).json({error: 'Past date are not permited'});
     }
/**
 * Checa se ja nao existe um agendamento nesta mesma hora que estou querendo marcar
 */
     const checkAvailability = await Appointment.findOne({
       where: {
         provider_id,
         canceled_at: null,
         date: hourStart,
       },
     });
/**
 * Se foi true, é porque ja existe agendamento nesta hora que quero marcar
 */
     if(checkAvailability){
      return res.status(400)
      .json({error: 'Appointment date is not available'});
     }

     const appointment = await Appointment.create({
       user_id: req.user_id,
       provider_id,
       date: hourStart, //recebe hourStart para garantir que as horas nao terao numeros quebrados, com minutos e segundos.
     });

    return res.json(appointment);
  }
}

export default new AppointmentController();