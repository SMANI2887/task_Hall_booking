// import library
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// middleware
app.use(bodyParser.json());

//creating variable room details
let rooms = [
  {
    roomID: 101,
    seatsAvailable: 4,
    amenities: "AC",
    pricePerHr: 100,
  },
  {
    roomID: 102,
    seatsAvailable: 2,
    amenities: "AC",
    pricePerHr: 50,
  },
  {
    roomID: 103,
    seatsAvailable: 6,
    amenities: "AC",
    pricePerHr: 150,
  },
];

//creating variable booking details
let booking = [
  {
    customer: "mani",
    bookingDate: "2024/03/30",
    startTime: "12:00 AM",
    endTime: "11:59 PM",
    bookingID: "B1",
    roomID: 101,
    status: "Booked",
    bookedOn: "02/04/2024",
  },
  {
    customer: "kani",
    bookingDate: "2024/03/30",
    startTime: "10:00 AM",
    endTime: "09:59 PM",
    bookingID: "B2",
    roomID: 102,
    status: "Booked",
    bookedOn: "10/04/2024",
  },
  {
    customer: "anitha",
    bookingDate: "2024/03/30",
    startTime: "08:00 AM",
    endTime: "07:59 PM",
    bookingID: "B3",
    roomID: 103,
    status: "Booked",
    bookedOn: "08/04/2024",
  },
];

//creating variable customer details
let customers = [
  {
    name: "mani",
    booking: [
      {
        customer: "mani",
        bookingDate: "2024/03/30",
        startTime: "12:00 AM",
        endTime: "11:59 PM",
        bookingID: "B1",
        roomID: 101,
        status: "Booked",
        bookedOn: "02/04/2024",
      },
    ],
  },
  {
    name: "kani",
    booking: [
      {
        customer: "kani",
        bookingDate: "2024/03/30",
        startTime: "10:00 AM",
        endTime: "09:59 PM",
        bookingID: "B2",
        roomID: 102,
        status: "Booked",
        bookedOn: "10/04/2024",
      },
    ],
  },
  {
    name: "anitha",
    booking: [
      {
        customer: "anitha",
        bookingDate: "2024/03/30",
        startTime: "08:00 AM",
        endTime: "07:59 PM",
        bookingID: "B3",
        roomID: 103,
        status: "Booked",
        bookedOn: "08/04/2024",
      },
    ],
  },
];

// view all Rooms and Details
app.get("/rooms/all", (req, res) => {
  res.status(200).json({ RoomsList: rooms });
});

// 1.creating a Room with
app.post("/rooms/create", (req, res) => {
  const room = req.body;

  const idExists = rooms.find((el) => el.roomID === room.roomID);

  if (idExists !== undefined) {
    return res.status(400).json({ message: "room already exists." });
  } else {
    rooms.push(room);
    res.status(201).json({ message: "room created" });
  }
});

// 2.booking a Room with
app.post("/booking/create/:id", (req, res) => {
  try {
    const { id } = req.params;
    let bookRoom = req.body;
    let date = new Date();
    let dateformat = date.toLocaleDateString();
    let idExists = rooms.find((el) => el.roomID === Number(id));
    if (idExists === undefined) {
      return res
        .status(400)
        .json({ message: "room does not exist.", RoomsList: rooms });
    }
    //verifying the booked date
    let matchID = booking.filter((b) => b.roomID === id);
    if (matchID.length > 0) {
      let dateCheck = matchID.filter((m) => {
        return m.bookingDate === bookRoom.bookingDate;
      });
      if (dateCheck.length === 0) {
        let newID = "B" + (booking.length + 1);
        let newBooking = {
          ...bookRoom,
          bookingID: newID,
          roomID: id,
          status: "booked",
          bookedOn: dateformat,
        };
        booking.push(newBooking);
        return res.status(201).json({
          message: "Hall Booked",
          Booking: booking,
          added: newBooking,
        });
      } else {
        return res.status(400).json({
          message: "Hall Already booked for this date, choose another hall",
          Booking: booking,
        });
      }
    } else {
      let newID = "B" + (booking.length + 1);
      let newBooking = {
        ...bookRoom,
        bookingID: newID,
        roomID: id,
        status: "booked",
        bookedOn: dateformat,
      };
      booking.push(newBooking);
      const customerDetails = customers.find(
        (c) => c.name === newBooking.customer
      );
      if (customerDetails) {
        customerDetails.booking.push(newBooking);
      } else {
        customers.push({ name: newBooking.customer, booking: [newBooking] });
      }
      return res
        .status(201)
        .json({ message: "Hall Booked", Booking: booking, added: newBooking });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "error booking room", error: error, data: booking });
  }
});

// 3.List all rooms with booked data with
app.get("/viewbooking", (req, res) => {
  const bookedRooms = booking.map((bookings) => {
    const { roomID, status, customer, bookingDate, startTime, endTime } =
      bookings;
    return { roomID, status, customer, bookingDate, startTime, endTime };
  });
  res.status(201).json(bookedRooms);
});

// 4.list all customers with booked data with
app.get("/customers", (req, res) => {
  const customerDetails = customers.map((customer) => {
    const { name, booking } = customer;
    const customerDetails = booking.map((bookings) => {
      const { roomID, bookingDate, startTime, endTime } = bookings;
      return { name, roomID, bookingDate, startTime, endTime };
    });
    return customerDetails;
  });
  res.json(customerDetails);
});

// 5.API to list how many times the user booked the room
app.get("/customer/:name", (req, res) => {
  const { name } = req.params;
  const customer = customers.find((cust) => cust.name === name);
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  const customerBookings = customer.booking.map((bookings) => {
    const {
      customer,
      roomID,
      startTime,
      endTime,
      bookingID,
      status,
      bookingDate,
      bookedOn,
    } = bookings;
    return {
      customer,
      roomID,
      startTime,
      endTime,
      bookingID,
      status,
      bookingDate,
      bookedOn,
    };
  });
  res.json(customerBookings);
});

const HOSTNAME = "127.0.0.1";
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running http://${HOSTNAME}:${PORT}`);
});
