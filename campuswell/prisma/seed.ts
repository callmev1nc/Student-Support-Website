import "dotenv/config"
import { PrismaClient, Role, TicketCategory, TicketPriority, TicketStatus, AppointmentStatus, NotificationType } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  host: "aws-1-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.fvoophnzfvwwapwmwinp",
  password: process.env.SUPABASE_DB_PASSWORD || "Vi0909013878",
  ssl: { rejectUnauthorized: false }
})
const prisma = new PrismaClient({ adapter })

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function hoursFromNow(hours: number): Date {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d
}

async function main() {
  console.log("🌱 Seeding database...")

  // Clean up existing data
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.user.deleteMany()

  // ── Users ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 12)
  const staffPasswordHash = await bcrypt.hash("staff123", 12)
  const studentPasswordHash = await bcrypt.hash("student123", 12)

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@campuswell.edu",
      passwordHash,
      role: "ADMIN",
      bio: "Platform administrator with full system access.",
    },
  })

  const drSmith = await prisma.user.create({
    data: {
      name: "Dr. Sarah Smith",
      email: "dr.smith@campuswell.edu",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      bio: "Senior Counsellor with 10+ years experience in student mental health support.",
    },
  })

  const jamesMiller = await prisma.user.create({
    data: {
      name: "James Miller",
      email: "j.miller@campuswell.edu",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      bio: "Academic Advisor specializing in course planning and study skills.",
    },
  })

  const lisaChen = await prisma.user.create({
    data: {
      name: "Lisa Chen",
      email: "l.chen@campuswell.edu",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      bio: "Wellbeing Officer focused on student engagement and community building.",
    },
  })

  const vinh = await prisma.user.create({
    data: {
      name: "Vinh Nguyen",
      email: "vinh@student.westernsydney.edu.au",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      bio: "Computer Science student, 3rd year. Passionate about web development.",
    },
  })

  const emily = await prisma.user.create({
    data: {
      name: "Emily Watson",
      email: "e.watson@student.westernsydney.edu.au",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      bio: "Psychology student, 2nd year. Interested in clinical psychology.",
    },
  })

  const marcus = await prisma.user.create({
    data: {
      name: "Marcus Johnson",
      email: "m.johnson@student.westernsydney.edu.au",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      bio: "Business student, 1st year. Looking for career guidance.",
    },
  })

  const sophie = await prisma.user.create({
    data: {
      name: "Sophie Taylor",
      email: "s.taylor@student.westernsydney.edu.au",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      bio: "Nursing student, 2nd year. Passionate about community health.",
    },
  })

  const david = await prisma.user.create({
    data: {
      name: "David Kim",
      email: "d.kim@student.westernsydney.edu.au",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      bio: "Engineering student, 3rd year. Active in student societies.",
    },
  })

  const rachel = await prisma.user.create({
    data: {
      name: "Rachel Brown",
      email: "r.brown@student.westernsydney.edu.au",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      bio: "Arts student, 1st year. Exploring different creative pathways.",
    },
  })

  console.log(`  ✅ Created 10 users`)

  // ── Tickets ────────────────────────────────────────────
  const tickets = [
    {
      subject: "Unable to access online course materials",
      description: "I've been trying to access the COMP3028 lecture recordings on vUWS but keep getting a 403 Forbidden error. This started after the semester break. I've tried clearing my cache and using different browsers.",
      category: "TECHNICAL" as TicketCategory,
      priority: "HIGH" as TicketPriority,
      status: "IN_PROGRESS" as TicketStatus,
      studentId: vinh.id,
      assignedToId: jamesMiller.id,
      createdAt: daysAgo(12),
    },
    {
      subject: "Feeling overwhelmed with assignments",
      description: "I have 4 major assignments due in the same week and I'm feeling really stressed. I can't sleep properly and I'm having trouble concentrating. I think I might need an extension but I'm not sure how to ask.",
      category: "MENTAL_HEALTH" as TicketCategory,
      priority: "HIGH" as TicketPriority,
      status: "ASSIGNED" as TicketStatus,
      studentId: emily.id,
      assignedToId: drSmith.id,
      createdAt: daysAgo(10),
    },
    {
      subject: "Subject selection advice needed",
      description: "I'm unsure about which electives to choose for next semester. I want to keep my options open for honours but also want practical skills for industry. Can someone help me plan?",
      category: "ACADEMIC" as TicketCategory,
      priority: "MEDIUM" as TicketPriority,
      status: "NEW" as TicketStatus,
      studentId: marcus.id,
      createdAt: daysAgo(2),
    },
    {
      subject: "Experiencing bullying in group project",
      description: "One of my group members keeps dismissing my contributions and making belittling comments during meetings. It's making me not want to attend classes. I've tried addressing it but it continues.",
      category: "BULLYING" as TicketCategory,
      priority: "URGENT" as TicketPriority,
      status: "IN_REVIEW" as TicketStatus,
      studentId: sophie.id,
      assignedToId: lisaChen.id,
      createdAt: daysAgo(5),
    },
    {
      subject: "Attendance record discrepancy",
      description: "My attendance for PSYC2010 shows I missed 3 tutorials, but I attended all of them. I have notes and my tutor can confirm. How do I get this corrected?",
      category: "ATTENDANCE" as TicketCategory,
      priority: "MEDIUM" as TicketPriority,
      status: "WAITING" as TicketStatus,
      studentId: emily.id,
      assignedToId: jamesMiller.id,
      createdAt: daysAgo(8),
    },
    {
      subject: "Financial hardship - textbook costs",
      description: "I'm a first-year student and the cost of textbooks this semester is over $600. I'm working part-time but barely covering rent. Are there any financial assistance programs or second-hand book options?",
      category: "FINANCIAL" as TicketCategory,
      priority: "MEDIUM" as TicketPriority,
      status: "RESOLVED" as TicketStatus,
      studentId: rachel.id,
      assignedToId: lisaChen.id,
      createdAt: daysAgo(20),
    },
    {
      subject: "WiFi keeps disconnecting in Library",
      description: "The university WiFi in the Parramatta South library keeps dropping every 15-20 minutes. It's really frustrating when trying to do research. This has been happening for the past 2 weeks.",
      category: "TECHNICAL" as TicketCategory,
      priority: "LOW" as TicketPriority,
      status: "NEW" as TicketStatus,
      studentId: david.id,
      createdAt: daysAgo(1),
    },
    {
      subject: "Career transition guidance",
      description: "I'm in my final year of Business and considering a career change to data analytics. What steps should I take? Are there any bridging courses or certifications you'd recommend?",
      category: "ACADEMIC" as TicketCategory,
      priority: "LOW" as TicketPriority,
      status: "CLOSED" as TicketStatus,
      studentId: marcus.id,
      assignedToId: jamesMiller.id,
      createdAt: daysAgo(25),
    },
    {
      subject: "Anxiety about upcoming exams",
      description: "I have my final exams coming up in 3 weeks and I'm having panic attacks. I can barely study. My heart races and I feel like I can't breathe. I need help managing this.",
      category: "MENTAL_HEALTH" as TicketCategory,
      priority: "URGENT" as TicketPriority,
      status: "ASSIGNED" as TicketStatus,
      studentId: sophie.id,
      assignedToId: drSmith.id,
      createdAt: daysAgo(3),
    },
    {
      subject: "Lab equipment malfunction",
      description: "The oscilloscope at Station 7 in the Engineering lab (Building EA, Level 2) is giving incorrect readings. I've verified this with my lab partner. This is affecting our project work.",
      category: "TECHNICAL" as TicketCategory,
      priority: "MEDIUM" as TicketPriority,
      status: "IN_PROGRESS" as TicketStatus,
      studentId: david.id,
      assignedToId: jamesMiller.id,
      createdAt: daysAgo(7),
    },
    {
      subject: "Study group space booking",
      description: "Is it possible to book a study room for a regular weekly session? We're a group of 5 students working on a semester-long project and need a consistent space.",
      category: "GENERAL" as TicketCategory,
      priority: "LOW" as TicketPriority,
      status: "RESOLVED" as TicketStatus,
      studentId: vinh.id,
      assignedToId: lisaChen.id,
      createdAt: daysAgo(15),
    },
    {
      subject: "Withdrawal from a unit - need advice",
      description: "I'm considering withdrawing from MATH2001 because I'm falling behind. What are the implications for my GPA and enrolment? Is there a deadline I should know about?",
      category: "ACADEMIC" as TicketCategory,
      priority: "HIGH" as TicketPriority,
      status: "ASSIGNED" as TicketStatus,
      studentId: rachel.id,
      assignedToId: jamesMiller.id,
      createdAt: daysAgo(4),
    },
    {
      subject: "Noise complaint in student accommodation",
      description: "The students in the room above mine play loud music every night after 11pm. I've asked them nicely but it hasn't stopped. It's affecting my sleep and my grades.",
      category: "GENERAL" as TicketCategory,
      priority: "MEDIUM" as TicketPriority,
      status: "IN_REVIEW" as TicketStatus,
      studentId: emily.id,
      assignedToId: lisaChen.id,
      createdAt: daysAgo(6),
    },
    {
      subject: "Help with referencing and academic writing",
      description: "I keep losing marks for incorrect APA referencing. Is there a workshop or resource that can help me improve? My tutor said I should seek additional support.",
      category: "ACADEMIC" as TicketCategory,
      priority: "MEDIUM" as TicketPriority,
      status: "NEW" as TicketStatus,
      studentId: rachel.id,
      createdAt: daysAgo(1),
    },
    {
      subject: "Practicum placement concerns",
      description: "I've been assigned to a hospital 90 minutes from where I live for my nursing practicum. I don't have reliable transport. Can I request a change to a closer facility?",
      category: "GENERAL" as TicketCategory,
      priority: "HIGH" as TicketPriority,
      status: "IN_PROGRESS" as TicketStatus,
      studentId: sophie.id,
      assignedToId: drSmith.id,
      createdAt: daysAgo(9),
    },
    {
      subject: "Scholarship application support",
      description: "I want to apply for the Vice-Chancellor's Excellence Scholarship but I need help with my personal statement. Can someone review it and provide feedback?",
      category: "FINANCIAL" as TicketCategory,
      priority: "LOW" as TicketPriority,
      status: "WAITING" as TicketStatus,
      studentId: vinh.id,
      assignedToId: jamesMiller.id,
      createdAt: daysAgo(11),
    },
    {
      subject: "Feeling isolated as an international student",
      description: "I'm an international student from Vietnam and I'm finding it hard to make friends and adjust to life here. I miss my family a lot. Are there any support groups or social events?",
      category: "MENTAL_HEALTH" as TicketCategory,
      priority: "MEDIUM" as TicketPriority,
      status: "NEW" as TicketStatus,
      studentId: vinh.id,
      createdAt: daysAgo(0),
    },
    {
      subject: "Accessible learning materials request",
      description: "I have a documented learning disability and need lecture materials in advance. How do I arrange this? I registered with Accessibility Services last year.",
      category: "ACADEMIC" as TicketCategory,
      priority: "HIGH" as TicketPriority,
      status: "ASSIGNED" as TicketStatus,
      studentId: david.id,
      assignedToId: drSmith.id,
      createdAt: daysAgo(3),
    },
  ]

  const createdTickets = []
  for (const ticket of tickets) {
    const t = await prisma.ticket.create({ data: ticket })
    createdTickets.push(t)
  }
  console.log(`  ✅ Created ${createdTickets.length} tickets`)

  // ── Comments ───────────────────────────────────────────
  const comments = [
    // Ticket 1 (vinh's technical issue)
    { content: "I've checked with IT and it seems to be a permissions issue that sometimes occurs after semester breaks. They're looking into it now.", ticketId: createdTickets[0].id, authorId: jamesMiller.id, createdAt: daysAgo(10) },
    { content: "Thanks James! Any update? I still can't access the materials and the assignment is due next week.", ticketId: createdTickets[0].id, authorId: vinh.id, createdAt: daysAgo(8) },
    { content: "IT has reset your permissions. Please try logging out and back in. If it still doesn't work, try clearing your browser cookies.", ticketId: createdTickets[0].id, authorId: jamesMiller.id, createdAt: daysAgo(7) },

    // Ticket 2 (emily's overwhelm)
    { content: "Hi Emily, thank you for reaching out. I understand how stressful this time can be. Let's schedule a session to discuss your options and possibly arrange extensions. Please check your appointments page.", ticketId: createdTickets[1].id, authorId: drSmith.id, createdAt: daysAgo(9) },
    { content: "Thank you Dr. Smith, I've booked an appointment for Thursday.", ticketId: createdTickets[1].id, authorId: emily.id, createdAt: daysAgo(8) },

    // Ticket 6 (rachel's financial - resolved)
    { content: "Hi Rachel, I've found some options for you: 1) The university has a textbook lending library, 2) There's a financial hardship grant you can apply for, and 3) The student union runs a second-hand book sale each semester.", ticketId: createdTickets[5].id, authorId: lisaChen.id, createdAt: daysAgo(18) },
    { content: "The textbook lending library saved me! Thank you so much Lisa, this is really helpful.", ticketId: createdTickets[5].id, authorId: rachel.id, createdAt: daysAgo(17) },

    // Ticket 11 (vinh's study space - resolved)
    { content: "You can book study rooms through the library website. I've sent you the link and instructions. You can set up a recurring booking for the whole semester.", ticketId: createdTickets[10].id, authorId: lisaChen.id, createdAt: daysAgo(14) },
    { content: "Perfect, I've booked Room 3.05 for every Thursday afternoon. Thanks!", ticketId: createdTickets[10].id, authorId: vinh.id, createdAt: daysAgo(13) },
  ]

  for (const comment of comments) {
    await prisma.comment.create({ data: comment })
  }
  console.log(`  ✅ Created ${comments.length} comments`)

  // ── Appointments ───────────────────────────────────────
  const appointments = [
    { title: "Initial Counselling Session", description: "First session to discuss stress management strategies", status: "CONFIRMED" as AppointmentStatus, scheduledAt: hoursFromNow(48), durationMinutes: 60, studentId: emily.id, staffId: drSmith.id },
    { title: "Academic Advising Session", description: "Subject selection planning for next semester", status: "CONFIRMED" as AppointmentStatus, scheduledAt: hoursFromNow(72), durationMinutes: 30, studentId: marcus.id, staffId: jamesMiller.id },
    { title: "Wellbeing Check-in", description: "Follow-up on accommodation concerns", status: "PENDING" as AppointmentStatus, scheduledAt: hoursFromNow(96), durationMinutes: 30, studentId: emily.id, staffId: lisaChen.id },
    { title: "Career Planning Workshop", description: "Discuss transition to data analytics", status: "COMPLETED" as AppointmentStatus, scheduledAt: daysAgo(5), durationMinutes: 45, studentId: marcus.id, staffId: jamesMiller.id },
    { title: "Mental Health Assessment", description: "Initial assessment for anxiety management", status: "CONFIRMED" as AppointmentStatus, scheduledAt: hoursFromNow(24), durationMinutes: 60, studentId: sophie.id, staffId: drSmith.id },
    { title: "Financial Aid Consultation", description: "Discuss scholarship application and financial support options", status: "CONFIRMED" as AppointmentStatus, scheduledAt: hoursFromNow(120), durationMinutes: 30, studentId: vinh.id, staffId: jamesMiller.id },
    { title: "Accessibility Services Review", description: "Review learning accommodation plan for the semester", status: "COMPLETED" as AppointmentStatus, scheduledAt: daysAgo(10), durationMinutes: 30, studentId: david.id, staffId: drSmith.id },
    { title: "Study Skills Workshop", description: "Time management and exam preparation strategies", status: "PENDING" as AppointmentStatus, scheduledAt: hoursFromNow(168), durationMinutes: 60, studentId: rachel.id, staffId: jamesMiller.id },
    { title: "Group Conflict Mediation", description: "Facilitated discussion about group project dynamics", status: "CONFIRMED" as AppointmentStatus, scheduledAt: hoursFromNow(36), durationMinutes: 45, studentId: sophie.id, staffId: lisaChen.id },
    { title: "International Student Support", description: "Discuss social integration and community resources", status: "PENDING" as AppointmentStatus, scheduledAt: hoursFromNow(144), durationMinutes: 30, studentId: vinh.id, staffId: lisaChen.id },
    { title: "Practicum Placement Review", description: "Discuss alternative placement options closer to home", status: "IN_PROGRESS" as AppointmentStatus, scheduledAt: daysAgo(3), durationMinutes: 30, studentId: sophie.id, staffId: drSmith.id },
    { title: "Withdrawal Counselling", description: "Discuss implications and alternatives to unit withdrawal", status: "CONFIRMED" as AppointmentStatus, scheduledAt: hoursFromNow(52), durationMinutes: 30, studentId: rachel.id, staffId: jamesMiller.id },
  ]

  for (const apt of appointments) {
    await prisma.appointment.create({ data: apt })
  }
  console.log(`  ✅ Created ${appointments.length} appointments`)

  // ── Conversations & Messages ───────────────────────────
  // Conversation 1: Vinh ↔ Dr. Smith
  const conv1 = await prisma.conversation.create({
    data: { participantAId: vinh.id, participantBId: drSmith.id, lastMessageAt: daysAgo(1) },
  })
  await prisma.message.createMany({
    data: [
      { content: "Hi Dr. Smith, I wanted to discuss some concerns about my studies. Is this a good time?", conversationId: conv1.id, senderId: vinh.id, createdAt: daysAgo(5) },
      { content: "Hello Vinh! Of course, I'm here to help. What's on your mind?", conversationId: conv1.id, senderId: drSmith.id, createdAt: daysAgo(5) },
      { content: "I've been feeling overwhelmed with the workload this semester. I'm taking 4 units and working part-time.", conversationId: conv1.id, senderId: vinh.id, createdAt: daysAgo(4) },
      { content: "That's a common challenge, especially in 3rd year. Have you considered dropping to 3 units? It might help you maintain better grades and wellbeing.", conversationId: conv1.id, senderId: drSmith.id, createdAt: daysAgo(4) },
      { content: "I hadn't thought about that. Would it affect my graduation timeline?", conversationId: conv1.id, senderId: vinh.id, createdAt: daysAgo(3) },
      { content: "It might extend by one semester, but it's often worth it for your mental health. Let's discuss this in our next appointment.", conversationId: conv1.id, senderId: drSmith.id, createdAt: daysAgo(2) },
      { content: "Sounds good, I've booked an appointment. Thanks for the advice!", conversationId: conv1.id, senderId: vinh.id, readAt: daysAgo(1), createdAt: daysAgo(1) },
    ],
  })

  // Conversation 2: Emily ↔ Lisa Chen
  const conv2 = await prisma.conversation.create({
    data: { participantAId: emily.id, participantBId: lisaChen.id, lastMessageAt: daysAgo(2) },
  })
  await prisma.message.createMany({
    data: [
      { content: "Hi Lisa, I wanted to ask about the noise complaint process for student accommodation.", conversationId: conv2.id, senderId: emily.id, createdAt: daysAgo(7) },
      { content: "Hi Emily! I'm sorry to hear you're dealing with that. Have you spoken to your RA first?", conversationId: conv2.id, senderId: lisaChen.id, createdAt: daysAgo(7) },
      { content: "Yes, but the noise continues. It's really affecting my sleep.", conversationId: conv2.id, senderId: emily.id, createdAt: daysAgo(6) },
      { content: "I understand. I'll escalate this to the accommodation manager. Could you document the times and dates for the past week?", conversationId: conv2.id, senderId: lisaChen.id, createdAt: daysAgo(5) },
      { content: "Sure, I'll send you the log by tomorrow. Thank you for helping with this!", conversationId: conv2.id, senderId: emily.id, readAt: daysAgo(2), createdAt: daysAgo(2) },
    ],
  })

  // Conversation 3: Sophie ↔ Dr. Smith (about anxiety)
  const conv3 = await prisma.conversation.create({
    data: { participantAId: sophie.id, participantBId: drSmith.id, lastMessageAt: daysAgo(0) },
  })
  await prisma.message.createMany({
    data: [
      { content: "Dr. Smith, I've been having panic attacks thinking about exams. My heart races and I can't breathe.", conversationId: conv3.id, senderId: sophie.id, createdAt: daysAgo(3) },
      { content: "Sophie, I'm glad you reached out. This is important and we should address it promptly. I have an appointment slot tomorrow.", conversationId: conv3.id, senderId: drSmith.id, createdAt: daysAgo(3) },
      { content: "I booked it. Is there anything I can do in the meantime?", conversationId: conv3.id, senderId: sophie.id, createdAt: daysAgo(2) },
      { content: "Try the 4-7-8 breathing technique: breathe in for 4 seconds, hold for 7, exhale for 8. It can help during a panic attack. We'll discuss more strategies in our session.", conversationId: conv3.id, senderId: drSmith.id, createdAt: daysAgo(2) },
      { content: "I tried the breathing technique last night and it helped. Thank you so much!", conversationId: conv3.id, senderId: sophie.id, createdAt: daysAgo(0) },
    ],
  })

  // Conversation 4: Marcus ↔ James Miller
  const conv4 = await prisma.conversation.create({
    data: { participantAId: marcus.id, participantBId: jamesMiller.id, lastMessageAt: daysAgo(4) },
  })
  await prisma.message.createMany({
    data: [
      { content: "Hi James, I'm considering switching from Marketing to Data Analytics. Is that possible mid-degree?", conversationId: conv4.id, senderId: marcus.id, createdAt: daysAgo(8) },
      { content: "Hi Marcus! Great question. It depends on how many credits transfer over. Let's review your transcript in our next session.", conversationId: conv4.id, senderId: jamesMiller.id, createdAt: daysAgo(7) },
      { content: "I've uploaded my unofficial transcript to the portal. Will you be able to review it before our meeting?", conversationId: conv4.id, senderId: marcus.id, createdAt: daysAgo(6) },
      { content: "Got it! I'll review it beforehand so we can make the most of our time. See you Thursday!", conversationId: conv4.id, senderId: jamesMiller.id, readAt: daysAgo(4), createdAt: daysAgo(4) },
    ],
  })

  // Conversation 5: David ↔ Lisa Chen
  const conv5 = await prisma.conversation.create({
    data: { participantAId: david.id, participantBId: lisaChen.id, lastMessageAt: daysAgo(6) },
  })
  await prisma.message.createMany({
    data: [
      { content: "Hi Lisa, do you know when the next student society fair is? I want to get involved.", conversationId: conv5.id, senderId: david.id, createdAt: daysAgo(10) },
      { content: "Hi David! The Clubs & Societies Expo is in Week 3. I'll send you the details. What kind of societies interest you?", conversationId: conv5.id, senderId: lisaChen.id, createdAt: daysAgo(9) },
      { content: "Mostly engineering and tech-related ones. Maybe robotics or coding club?", conversationId: conv5.id, senderId: david.id, createdAt: daysAgo(8) },
      { content: "Perfect! We have both of those. I'll include their info in the email. Great to see you getting involved! 🎉", conversationId: conv5.id, senderId: lisaChen.id, readAt: daysAgo(6), createdAt: daysAgo(6) },
    ],
  })

  // Conversation 6: Rachel ↔ James Miller
  const conv6 = await prisma.conversation.create({
    data: { participantAId: rachel.id, participantBId: jamesMiller.id, lastMessageAt: daysAgo(3) },
  })
  await prisma.message.createMany({
    data: [
      { content: "Hi James, I'm really struggling with APA referencing. My tutor said I should get extra help.", conversationId: conv6.id, senderId: rachel.id, createdAt: daysAgo(5) },
      { content: "Hi Rachel! No worries, this is very common for first-year students. The library runs APA workshops, and I can also help during our advising sessions.", conversationId: conv6.id, senderId: jamesMiller.id, createdAt: daysAgo(4) },
      { content: "That would be great! When's the next workshop?", conversationId: conv6.id, senderId: rachel.id, readAt: daysAgo(3), createdAt: daysAgo(3) },
    ],
  })

  console.log(`  ✅ Created 6 conversations with messages`)

  // ── Notifications ──────────────────────────────────────
  const notifications = [
    { title: "Ticket Assigned", message: "You've been assigned a new technical support ticket from Vinh Nguyen", type: "TICKET" as NotificationType, userId: jamesMiller.id, link: `/tickets/${createdTickets[0].id}`, read: true },
    { title: "New Comment", message: "Vinh Nguyen commented on your ticket about course materials", type: "TICKET" as NotificationType, userId: jamesMiller.id, link: `/tickets/${createdTickets[0].id}`, read: false },
    { title: "Appointment Confirmed", message: "Your counselling session with Dr. Smith has been confirmed", type: "APPOINTMENT" as NotificationType, userId: emily.id, read: true },
    { title: "Upcoming Appointment", message: "Reminder: You have an appointment tomorrow at 2:00 PM", type: "APPOINTMENT" as NotificationType, userId: sophie.id, read: false },
    { title: "New Message", message: "Dr. Sarah Smith sent you a message", type: "MESSAGE" as NotificationType, userId: vinh.id, link: `/messages/${conv1.id}`, read: true },
    { title: "Ticket Resolved", message: "Your textbook assistance ticket has been resolved", type: "TICKET" as NotificationType, userId: rachel.id, link: `/tickets/${createdTickets[5].id}`, read: true },
    { title: "New Message", message: "Lisa Chen sent you a message", type: "MESSAGE" as NotificationType, userId: emily.id, link: `/messages/${conv2.id}`, read: false },
    { title: "Urgent Ticket", message: "An urgent bullying report needs your attention", type: "TICKET" as NotificationType, userId: lisaChen.id, link: `/tickets/${createdTickets[3].id}`, read: false },
    { title: "Appointment Tomorrow", message: "You have a career planning session tomorrow", type: "APPOINTMENT" as NotificationType, userId: marcus.id, read: false },
    { title: "New Announcement", message: "New campus announcement: Library hours extended for exam period", type: "ANNOUNCEMENT" as NotificationType, userId: vinh.id, read: false },
    { title: "Ticket Status Changed", message: "Your WiFi issue ticket is now being reviewed", type: "TICKET" as NotificationType, userId: david.id, link: `/tickets/${createdTickets[6].id}`, read: true },
    { title: "Appointment Cancelled", message: "Your practum review has been rescheduled", type: "APPOINTMENT" as NotificationType, userId: sophie.id, read: false },
    { title: "New Ticket", message: "A new mental health support request has been submitted", type: "TICKET" as NotificationType, userId: drSmith.id, link: `/tickets/${createdTickets[8].id}`, read: true },
    { title: "New Message", message: "Sophie Taylor sent you a message about her anxiety", type: "MESSAGE" as NotificationType, userId: drSmith.id, link: `/messages/${conv3.id}`, read: false },
    { title: "System Announcement", message: "CampusWell platform has been updated with new features", type: "ANNOUNCEMENT" as NotificationType, userId: admin.id, read: true },
  ]

  for (const notif of notifications) {
    await prisma.notification.create({ data: { ...notif, createdAt: daysAgo(Math.floor(Math.random() * 14)) } })
  }
  console.log(`  ✅ Created ${notifications.length} notifications`)

  // ── Announcements ──────────────────────────────────────
  const announcements = [
    {
      title: "Welcome to CampusWell — Your Student Support Platform",
      content: "Welcome to CampusWell! This is your one-stop platform for accessing student support services at Western Sydney University. Here you can submit support tickets, book appointments with counsellors and advisors, message support staff, and access helpful resources. We're here to help you succeed!\n\nGetting started:\n• Submit a ticket for any academic, technical, or personal concern\n• Book an appointment with our support staff\n• Browse our Resource Centre for helpful guides\n• Check Announcements for important updates\n\nIf you have any questions, don't hesitate to reach out. We're here for you!",
      pinned: true,
      authorId: admin.id,
    },
    {
      title: "Library Hours Extended for Exam Period",
      content: "Great news! The Parramatta South and Bankstown libraries will have extended opening hours during the exam period (Weeks 13-16).\n\nNew hours:\n• Monday – Friday: 7:00 AM – 12:00 AM\n• Saturday – Sunday: 9:00 AM – 10:00 PM\n\nTake advantage of these extended hours to prepare for your exams. Study rooms can be booked through the library website.",
      pinned: false,
      authorId: admin.id,
    },
    {
      title: "Free Mental Health Workshops This Month",
      content: "The Student Wellbeing team is running free workshops throughout the month:\n\n• Stress Management 101 — Tuesday 2:00 PM\n• Mindfulness & Meditation — Thursday 11:00 AM\n• Exam Anxiety Workshop — Friday 3:00 PM\n\nAll workshops are held in Building EA, Room G.23. No registration required — just show up! For more information, contact Dr. Sarah Smith.",
      pinned: false,
      authorId: drSmith.id,
    },
    {
      title: "Semester 2 Enrolment Opens June 20",
      content: "Semester 2 enrolment opens on June 20th at 9:00 AM. Make sure to:\n\n1. Review your course progression in Student Services Online\n2. Check prerequisite requirements for your chosen units\n3. Book an academic advising appointment if you need help with subject selection\n4. Submit any pending special consideration requests\n\nContact Academic Services if you have any enrolment questions.",
      pinned: false,
      authorId: jamesMiller.id,
    },
  ]

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: { ...announcement, createdAt: daysAgo(announcements.indexOf(announcement) * 5) },
    })
  }
  console.log(`  ✅ Created ${announcements.length} announcements`)

  // ── Resources ──────────────────────────────────────────
  const resources = [
    { title: "Stress Management Guide for Students", description: "A comprehensive guide on identifying and managing academic stress, including breathing exercises, time management tips, and when to seek professional help.", category: "Mental Health", url: "#", type: "PDF", authorId: drSmith.id },
    { title: "APA Referencing Workshop Recording", description: "Recorded workshop covering APA 7th edition referencing style, in-text citations, and reference list formatting.", category: "Study Skills", url: "#", type: "VIDEO", authorId: jamesMiller.id },
    { title: "Career Planning Workbook", description: "Interactive workbook to help you identify your strengths, explore career options, and create an actionable career development plan.", category: "Career Advice", url: "#", type: "PDF", authorId: jamesMiller.id },
    { title: "Effective Study Techniques", description: "Research-backed study methods including spaced repetition, active recall, and the Pomodoro technique to maximize your learning efficiency.", category: "Study Skills", url: "#", type: "LINK", authorId: lisaChen.id },
    { title: "Crisis Support Hotline", description: "24/7 crisis support services: Lifeline (13 11 14), Beyond Blue (1300 22 4636), Emergency (000). You are not alone.", category: "Emergency", url: "#", type: "LINK", authorId: drSmith.id },
    { title: "Financial Assistance Programs", description: "Guide to university and government financial support including scholarships, grants, Centrelink benefits, and emergency financial aid.", category: "Academic Help", url: "#", type: "PDF", authorId: jamesMiller.id },
    { title: "Mindfulness Meditation Series", description: "A 6-part guided meditation series designed specifically for university students. Each session is 10-15 minutes.", category: "Mental Health", url: "#", type: "VIDEO", authorId: drSmith.id },
    { title: "Resume & Cover Letter Templates", description: "Professional resume and cover letter templates designed for university students and recent graduates, with writing tips and examples.", category: "Career Advice", url: "#", type: "PDF", authorId: jamesMiller.id },
    { title: "Time Management Planner", description: "Downloadable weekly planner template with sections for classes, study blocks, assignments, and personal time. Includes a prioritization matrix.", category: "Study Skills", url: "#", type: "PDF", authorId: lisaChen.id },
    { title: "Campus Security & Emergency Contacts", description: "Important contact numbers including Campus Security, Student Services, Health Centre, and after-hours emergency support.", category: "Emergency", url: "#", type: "LINK", authorId: admin.id },
  ]

  for (const resource of resources) {
    await prisma.resource.create({ data: resource })
  }
  console.log(`  ✅ Created ${resources.length} resources`)

  console.log("\n🎉 Seeding complete!")
  console.log("  📊 Summary:")
  console.log("    - 10 users (1 admin, 3 staff, 6 students)")
  console.log("    - 18 tickets across all categories and statuses")
  console.log("    - 9 comments on various tickets")
  console.log("    - 12 appointments")
  console.log("    - 6 conversations with 30 messages")
  console.log("    - 15 notifications")
  console.log("    - 4 announcements")
  console.log("    - 10 resources")
  console.log("\n  🔑 Demo Accounts:")
  console.log("    Admin:  admin@campuswell.edu / admin123")
  console.log("    Staff:  dr.smith@campuswell.edu / staff123")
  console.log("    Student: vinh@student.westernsydney.edu.au / student123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
