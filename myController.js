// npm i bad-words

const ChatRoom = require("./models/ChatRoom");
const ChatMessages = require("./models/ChatMessage");
const User = require("./models/User");
const io = require("./socket");

exports.userChatList = async (req, res, next) => {
  try {
    // const receiverId = req.user._id;
    const receiverId = req.query.userId;

    let fetchAllChat = await ChatRoom.find({
      $or: [{ sender: receiverId }, { receiver: receiverId }],
    })
      .populate({
        path: "sender",
        select: "name email",
      })
      .populate({
        path: "receiver",
        select: "name email",
      })
      .lean();

    fetchAllChat = fetchAllChat.map((chat) => {
      if (chat.sender && chat.sender._id && chat.receiver && chat.receiver._id) {
        const isReceiver = chat.sender._id.toString() === receiverId.toString();
        return {
          roomId: chat._id.toString(),
          user: isReceiver ? chat.receiver : chat.sender,
          latestMessage: false,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      }
      return null;
    });

    fetchAllChat = fetchAllChat.filter((chat) => chat);

    const latestMessageRoomIds = fetchAllChat.map((chat) => chat.roomId);

    let getLatestMessages = await ChatMessages.find({
      roomId: { $in: latestMessageRoomIds },
    })
      .populate("to", "name email")
      .lean();

    let unreadChats = 0;

    fetchAllChat.forEach((chat) => {
      const messageFilters = getLatestMessages.filter(
        (message) => message.roomId.toString() === chat.roomId
      );

      if (messageFilters[0] && !messageFilters[0].isRead) {
        unreadChats++;
      }

      chat.latestMessage = messageFilters[0] ? messageFilters[0] : false;
    });

    return res
      .status(200)
      .json({ success: true, data: fetchAllChat, unreadMessage: unreadChats });
  } catch (e) {
    console.log("error from-70", e); // Debugging
    next(e);
  }
};

exports.getChatMessages = async (req, res, next) => {
  try {
    console.log("this is calling now")
    let userId = req.query.userId;
    let parmsId = req.query.receiverId;
    let idRoom = false;
    let idRoom2 = await ChatRoom.findOne({
      sender: userId,
      receiver: parmsId,
    });
    if (idRoom2) {
      idRoom = idRoom2;
    }
    let idRoom3 = await ChatRoom.findOne({
      sender: parmsId,
      receiver: userId,
    });
    if (!idRoom2) {
      idRoom = idRoom3;
    }
    if (!idRoom) {
      idRoom = await ChatRoom.create({
        sender: userId,
        receiver: parmsId,
      });
    }
    if (idRoom && idRoom._id) {
      const ff = await ChatMessages.updateMany(
        { roomId: idRoom._id, to: userId },
        { $set: { isRead: true } },
        { multi: true }
      );
      let users = await ChatRoom.findOne({ _id: idRoom._id })
        .populate({
          path: "sender",
          select: "name email",
        })
        .populate({
          path: "receiver",
          select: "name email",
        })
        .lean();
      let allMessage;
      let totalMessage;
      if (req.query.skip && req.query.limit) {
        let skip = parseInt(req.query.skip);
        let limit = parseInt(req.query.limit);
        allMessage = await ChatMessages.find({ roomId: idRoom._id })
          .populate("to", "name email")
          .sort({ createdAt: -1, updatedAt: -1 })
          .lean()
          .skip(skip)
          .limit(limit);
        totalMessage = await ChatMessages.countDocuments({
          roomId: idRoom._id,
        });
      } else {
        allMessage = await ChatMessages.find({ roomId: idRoom._id })
          .populate("to", "name email")
          .sort({ createdAt: -1, updatedAt: -1 })
          .lean();
      }
      let unread = await ChatMessages.find({
        to: userId,
        roomId: idRoom,
        isRead: false,
      }).lean();
      return res
        .status(200)
        .json({
          success: true,
          data: allMessage,
          roomId: idRoom._id,
          roomDetails: users,
          unreadMessage: unread.length,
          totalMessage,
          // message: __("messageSend",
        });
    } else {
      return res
        .status(400)
        .json({ success: false, message: 'bad request' });
    }
  } catch (e) {
    console.log("error we have here@@", e);
    next(e);
  }
};


exports.sendMessagesFromMySide = async (req, res, next) => {
  try {
    const parmsId = req.body.receiverId;
    const userId = req.body.userId;
    // Fetch the recipient user and language in parallel
    const [fetchUsers, sendUser] = await Promise.all([
      User.findOne({ _id: parmsId }, { _id: 1, name: 1, email: 1 }),
      User.findOne({ _id: req.body.userId }, { _id: 1, name: 1, email: 1 })
    ]);

    // Create and send the chat message
    const sendMessage = await ChatMessages.create({
      to: fetchUsers._id,
      from: sendUser._id,
      message: req.body.message,
      roomId: req.body.roomId
    });
    let sendMessgaeData;
    if (sendMessage) {
      // Notify the recipient user via WebSocket
      sendMessgaeData = await ChatMessages.findOne({ _id: sendMessage._id }).populate("to", "name email").populate("from", "name email");
      await io.getio().emit(`${parmsId}`, { data: sendMessgaeData, isNewMessage: true });
    }
    return res.status(200).json({
      success: true,
      data: sendMessgaeData,
      message: "messageSend",
    });
  } catch (e) {
    next(e);
  }
};