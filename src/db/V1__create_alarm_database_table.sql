CREATE TYPE alert_trigger_enum AS ENUM (
    'EM_Button', -- Distress Button
    'MoodAlret',
    'UserREQ' --User Requested
);

CREATE TYPE alert_level_enum AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);

CREATE TABLE "Alarm Database (Active)" (
    "Case ID (PK)" UUID PRIMARY KEY,
    "Student UUID (FK)" UUID NOT NULL, -- Assuming a Foreign Key constraint is desired
    "Staff UUID (FK)" UUID,            -- Assuming a Foreign Key constraint is desired (could be null)
    "Alert Trigger" alert_trigger_enum NOT NULL,
    "Alert Level" alert_level_enum NOT NULL,
    -- Add ON DELETE/ON UPDATE actions if defining actual foreign key constraints
    -- FOREIGN KEY ("Student UUID (FK)") REFERENCES student_table("UUID"),
    -- FOREIGN KEY ("Staff UUID (FK)") REFERENCES staff_table("UUID")
    -- Note: You would need to have 'student_table' and 'staff_table' created first.
    -- The NOT NULL constraint on "Student UUID (FK)" is a common assumption for an alarm case.
    "Created At" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);