import pool from "../config/db.js";

export const getAllTasks = async () => {
  const [rows] = await pool.query("SELECT * FROM tasks");
  return rows;
};

export const getTaskById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
  return rows[0];
};

export const createTask = async (task) => {
  const [result] = await pool.query(
    "INSERT INTO tasks (project_id, title, phase, weight, status, startDate, targetDate, endDate, color) VALUES (?,?,?,?,?,?,?,?,?)",
    [
      task.project_id,
      task.title,
      task.phase,
      task.weight,
      task.status,
      task.startDate,
      task.targetDate,
      task.endDate,
      task.color || null,
    ],
  );
  return { id: result.insertId, ...task };
};

export const updateTask = async (id, task) => {
  const fields = [];
  const values = [];
  for (const key of [
    "project_id",
    "title",
    "phase",
    "weight",
    "status",
    "startDate",
    "targetDate",
    "endDate",
    "color",
  ]) {
    if (task[key] !== undefined) {
      fields.push(`${key}=?`);
      values.push(task[key]);
    }
  }
  if (fields.length === 0) return 0;
  values.push(id);
  const [result] = await pool.query(
    `UPDATE tasks SET ${fields.join(", ")} WHERE id=?`,
    values,
  );
  return result.affectedRows;
};

export const deleteTask = async (id) => {
  const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
  return result.affectedRows;
};

export const getTasksByProjectId = async (projectId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    "SELECT * FROM tasks WHERE project_id = ? LIMIT ? OFFSET ?",
    [projectId, limit, offset]
  );

  const [[{ count }]] = await pool.query(
    "SELECT COUNT(*) as count FROM tasks WHERE project_id = ?",
    [projectId]
  );

  return {
    tasks: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getTasksWithAssigneesByProjectId = async (projectId) => {
  const query = `
    SELECT 
      t.*,
      JSON_ARRAYAGG(
        CASE 
          WHEN d.id IS NOT NULL 
          THEN JSON_OBJECT('id', d.id, 'name', d.name, 'color', d.color, 'profile_picture', d.profile_picture)
          ELSE NULL 
        END
      ) AS assignees
    FROM tasks t
    LEFT JOIN task_assignees ta ON t.id = ta.task_id
    LEFT JOIN developers d ON ta.developer_id = d.id
    WHERE t.project_id = ?
    GROUP BY t.id
    ORDER BY t.phase, t.id
  `;
  
  const [rows] = await pool.query(query, [projectId]);
  
  return rows.map(row => ({
    ...row,
    assignees: row.assignees ? row.assignees.filter(assignee => assignee !== null) : []
  }));
};

export const getAllTasksWithAssignees = async () => {
  const query = `
    SELECT 
      t.*,
      p.name as project_name,
      JSON_ARRAYAGG(
        CASE 
          WHEN d.id IS NOT NULL 
          THEN JSON_OBJECT('id', d.id, 'name', d.name, 'color', d.color, 'profile_picture', d.profile_picture)
          ELSE NULL 
        END
      ) AS assignees
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN task_assignees ta ON t.id = ta.task_id
    LEFT JOIN developers d ON ta.developer_id = d.id
    GROUP BY t.id
    ORDER BY p.name, t.phase, t.id
  `;
  
  const [rows] = await pool.query(query);
  
  return rows.map(row => ({
    ...row,
    assignees: row.assignees ? row.assignees.filter(assignee => assignee !== null) : []
  }));
};

// Bulk update tasks (for Gantt drag & drop)
export const bulkUpdateTasks = async (updates) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const update of updates) {
      const { id, ...fields } = update;
      const fieldNames = [];
      const values = [];
      
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          fieldNames.push(`${key}=?`);
          values.push(value);
        }
      }
      
      if (fieldNames.length > 0) {
        values.push(id);
        const [result] = await connection.query(
          `UPDATE tasks SET ${fieldNames.join(", ")} WHERE id=?`,
          values
        );
        results.push({ id, affectedRows: result.affectedRows });
      }
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get structured Gantt data by project (hierarchical: project → phases → tasks)
export const getStructuredGanttDataByProject = async (projectId) => {
  const query = `
    SELECT 
      t.*,
      p.name as project_name,
      p.id as project_id,
      JSON_ARRAYAGG(
        CASE 
          WHEN d.id IS NOT NULL 
          THEN JSON_OBJECT('id', d.id, 'name', d.name, 'color', d.color)
          ELSE NULL 
        END
      ) AS assignees
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN task_assignees ta ON t.id = ta.task_id
    LEFT JOIN developers d ON ta.developer_id = d.id
    WHERE t.project_id = ?
    GROUP BY t.id
    ORDER BY t.phase, t.id
  `;
  
  const [rows] = await pool.query(query, [projectId]);
  
  // Structure data hierarchically
  const tasks = rows.map(row => ({
    ...row,
    assignees: row.assignees ? row.assignees.filter(assignee => assignee !== null) : []
  }));
  
  // Group by phase
  const phaseMap = {};
  tasks.forEach(task => {
    const phase = task.phase || 'Unassigned';
    if (!phaseMap[phase]) {
      phaseMap[phase] = [];
    }
    phaseMap[phase].push(task);
  });
  
  return {
    project: {
      id: projectId,
      name: tasks[0]?.project_name || 'Unknown Project'
    },
    phases: Object.entries(phaseMap).map(([phaseName, phaseTasks]) => ({
      name: phaseName,
      tasks: phaseTasks
    }))
  };
};