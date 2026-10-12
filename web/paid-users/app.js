(function (window, document) {
  'use strict';

  const statusLabels = {
    yes: '已覆盖',
    no: '确认未覆盖',
    unknown: '待核实'
  };

  const demoChartColors = {
    recharge: '#1677ff',
    churn: '#e58a3a',
    categories: ['#1677ff', '#35a37a', '#f2a541', '#a5afbd', '#7c5ce1', '#e36c55', '#2d9cdb'],
    coverage: ['#35a37a', '#c7d1df', '#e5a53a'],
    revisit: ['#1677ff', '#c7d1df', '#e5a53a'],
    server: '#1677ff'
  };

  const rechargeDetailFields = [
    { key: 'order_no', label: '平台订单号' },
    { key: 'cp_order_no', label: '游戏订单号' },
    { key: 'small_uid', label: '小号 ID' },
    { key: 'user_name', label: '玩家用户名' },
    { key: 'role_id', label: '角色 ID' },
    { key: 'role_name', label: '角色名' },
    { key: 'game_name', label: '游戏／包体' },
    { key: 'server_name', label: '区服' },
    { key: 'member_id', label: '推广员 ID' },
    { key: 'member_name', label: '推广员账号' },
    { key: 'order_amount', label: '订单金额', currency: true },
    { key: 'pay_amount', label: '实付金额', currency: true },
    { key: 'order_time', label: '下单时间' },
    { key: 'pay_time', label: '支付时间' },
    { key: 'project', label: '归属项目（映射）' },
    { key: 'platform', label: '平台' },
    { key: 'channel', label: '归属渠道（映射）' }
  ];

  const unknownReasons = {
    ambiguous: '演示依据：员工账号与用户身份键无法唯一匹配。',
    missingKey: '演示依据：用户微信身份键缺失。',
    unavailable: '演示依据：模拟接口未返回好友状态。'
  };

  const employeeDefinitions = [
    {
      id: 'staff-zhang',
      name: '张工',
      team: '一组',
      assignments: [
        ['U001', 'yes', '', ['角色001-甲', '角色001-乙']],
        ['U002', 'no', '', ['角色002-甲']],
        ['U003', 'unknown', 'ambiguous', ['角色003-甲']],
        ['U004', 'yes', '', ['角色004-甲']],
        ['U005', 'no', '', ['角色005-甲']],
        ['U006', 'unknown', 'missingKey', ['角色006-甲']],
        ['U007', 'yes', '', ['角色007-甲']],
        ['U008', 'no', '', ['角色008-甲']],
        ['U009', 'unknown', 'unavailable', ['角色009-甲']],
        ['U010', 'yes', '', ['角色010-甲']],
        ['U011', 'no', '', ['角色011-甲']],
        ['U012', 'unknown', 'ambiguous', ['角色012-甲']],
        ['U013', 'yes', '', ['角色013-甲']],
        ['U014', 'no', '', ['角色014-甲']],
        ['U015', 'unknown', 'missingKey', ['角色015-甲']]
      ]
    },
    {
      id: 'staff-li',
      name: '李工',
      team: '一组',
      assignments: [
        ['U008', 'yes', '', ['角色008-乙']],
        ['U009', 'no', '', ['角色009-乙']],
        ['U010', 'yes', '', ['角色010-乙']],
        ['U011', 'no', '', ['角色011-乙']],
        ['U012', 'yes', '', ['角色012-乙']],
        ['U013', 'no', '', ['角色013-乙']],
        ['U014', 'unknown', 'unavailable', ['角色014-乙']],
        ['U015', 'unknown', 'ambiguous', ['角色015-乙']],
        ['U016', 'unknown', 'missingKey', ['角色016-甲']],
        ['U017', 'yes', '', ['角色017-甲']],
        ['U018', 'no', '', ['角色018-甲']],
        ['U019', 'unknown', 'unavailable', ['角色019-甲']]
      ]
    },
    {
      id: 'staff-wang',
      name: '王工',
      team: '二组',
      assignments: [
        ['U018', 'yes', '', ['角色018-乙']],
        ['U019', 'no', '', ['角色019-乙']],
        ['U020', 'yes', '', ['角色020-甲']],
        ['U021', 'no', '', ['角色021-甲']],
        ['U022', 'yes', '', ['角色022-甲']],
        ['U023', 'no', '', ['角色023-甲']],
        ['U024', 'yes', '', ['角色024-甲']],
        ['U025', 'unknown', 'missingKey', ['角色025-甲']],
        ['U026', 'unknown', 'ambiguous', ['角色026-甲']],
        ['U027', 'unknown', 'unavailable', ['角色027-甲']]
      ]
    },
    {
      id: 'staff-zhao',
      name: '赵工',
      team: '二组',
      assignments: [
        ['U028', 'yes', '', ['角色028-甲']],
        ['U029', 'no', '', ['角色029-甲']],
        ['U030', 'yes', '', ['角色030-甲']],
        ['U031', 'no', '', ['角色031-甲']],
        ['U032', 'yes', '', ['角色032-甲']],
        ['U033', 'no', '', ['角色033-甲']],
        ['U034', 'yes', '', ['角色034-甲']],
        ['U035', 'unknown', 'ambiguous', ['角色035-甲']],
        ['U036', 'yes', '', ['角色036-甲']],
        ['U037', 'unknown', 'missingKey', ['角色037-甲']]
      ]
    }
  ];

  const nonBigRPrivateUsersByEmployee = [
    { employeeId: 'staff-zhang', userIds: ['U038', 'U039', 'U040', 'U041'] },
    { employeeId: 'staff-li', userIds: ['U041', 'U042', 'U043'] },
    { employeeId: 'staff-wang', userIds: ['U044', 'U045', 'U046'] },
    { employeeId: 'staff-zhao', userIds: ['U046', 'U047', 'U048'] }
  ];

  const demoPaidTierByUser = new Map([
    ['U038', '中R'], ['U039', '中R'], ['U040', '中R'], ['U041', '中R'], ['U042', '中R'], ['U043', '中R'],
    ['U044', '小R'], ['U045', '小R'], ['U046', '小R'], ['U047', '小R']
  ]);

  const demoPaidAssignments = [
    {
      employeeId: 'staff-zhang',
      assignments: [
        ['U038', 'yes', '', ['角色038-甲']],
        ['U039', 'no', '', ['角色039-甲']],
        ['U040', 'unknown', 'unavailable', ['角色040-甲']],
        ['U041', 'yes', '', ['角色041-甲']]
      ]
    },
    {
      employeeId: 'staff-li',
      assignments: [
        ['U041', 'no', '', ['角色041-乙']],
        ['U042', 'unknown', 'missingKey', ['角色042-甲']],
        ['U043', 'yes', '', ['角色043-甲']]
      ]
    },
    {
      employeeId: 'staff-wang',
      assignments: [
        ['U044', 'no', '', ['角色044-甲']],
        ['U045', 'yes', '', ['角色045-甲']],
        ['U046', 'unknown', 'ambiguous', ['角色046-甲']]
      ]
    },
    {
      employeeId: 'staff-zhao',
      assignments: [
        ['U046', 'yes', '', ['角色046-乙']],
        ['U047', 'no', '', ['角色047-甲']]
      ]
    }
  ];

  const demoProjects = [
    { id: 'project-a', name: '演示项目 A' },
    { id: 'project-b', name: '演示项目 B' }
  ];
  const usersInBothProjects = new Set(['U001', 'U008', 'U018', 'U029']);

  function projectIdsForUser(userId) {
    if (usersInBothProjects.has(userId)) {
      return demoProjects.map(function (project) { return project.id; });
    }
    const projectId = Number(userId.slice(1)) % 2 === 0 ? 'project-a' : 'project-b';
    return [projectId];
  }

  function projectNameFor(projectId) {
    return demoProjects.find(function (project) { return project.id === projectId; }).name;
  }

  function createRoleDetails(task) {
    const employeeIndex = employeeDefinitions.findIndex(function (person) {
      return person.id === task.employeeId;
    });
    const userNumber = Number(task.userId.slice(1));
    return task.projectIds.reduce(function (details, projectId, projectIndex) {
      const project = demoProjects.find(function (item) { return item.id === projectId; });
      task.roleNames.forEach(function (roleName, roleIndex) {
        const staffCode = task.employeeId.replace('staff-', '').slice(0, 1).toUpperCase();
        const roleSuffix = String(roleIndex + 1).padStart(2, '0');
        const serverNumber = (userNumber + employeeIndex + projectIndex + roleIndex) % 8 + 1;
        details.push({
          projectId: projectId,
          projectName: project.name,
          account: 'demo_' + task.userId.toLowerCase(),
          roleId: 'DEMO-' + task.userId + '-' + staffCode + '-' + projectId.slice(-1).toUpperCase() + '-' + roleSuffix,
          roleName: roleName,
          serverName: '安卓' + serverNumber + '区',
          cumulativeRecharge: 10000 + userNumber * 187 + employeeIndex * 103 + projectIndex * 431 + roleIndex * 89,
          lastLogin: '2026-09-' + String(20 + ((userNumber + employeeIndex + projectIndex + roleIndex) % 10)).padStart(2, '0')
        });
      });
      return details;
    }, []);
  }

  function createDemoModel() {
    const employees = employeeDefinitions.map(function (person) {
      return {
        id: person.id,
        name: person.name,
        team: person.team,
        privateUserIds: [],
        tasks: []
      };
    });
    const employeeById = new Map(employees.map(function (person) {
      return [person.id, person];
    }));
    const userById = new Map();
    const taskByKey = new Map();

    employeeDefinitions.forEach(function (person) {
      person.assignments.forEach(function (assignment) {
        const userId = assignment[0];
        const status = assignment[1];
        const reasonCode = assignment[2];
        const roleNames = assignment[3];
        const projectIds = projectIdsForUser(userId);
        const basis = status === 'unknown'
          ? unknownReasons[reasonCode]
          : status === 'yes'
            ? '演示依据：模拟个微接口确认双方为好友。'
            : '演示依据：模拟个微接口确认双方不是好友。';

        if (!userById.has(userId)) {
          userById.set(userId, {
            id: userId,
            name: '大R用户' + userId.slice(1),
            rating: '大R',
            paidTier: '大R',
            ratingBasis: '原型既有大R模拟名单；其他付费分类为独立演示样本，不由该名单推导。',
            projectIds: projectIds
          });
        }

        const key = person.id + '|' + userId;
        let task = taskByKey.get(key);
        if (!task) {
          task = {
            employeeId: person.id,
            employeeName: person.name,
            team: person.team,
            userId: userId,
            userName: userById.get(userId).name,
            rating: userById.get(userId).rating,
            paidTier: userById.get(userId).paidTier,
            ratingBasis: userById.get(userId).ratingBasis,
            projectIds: projectIds,
            status: status,
            basis: basis,
            roleNames: []
          };
          taskByKey.set(key, task);
        }
        roleNames.forEach(function (roleName) {
          if (!task.roleNames.includes(roleName)) task.roleNames.push(roleName);
        });
      });
    });

    nonBigRPrivateUsersByEmployee.forEach(function (membership) {
      const person = employeeById.get(membership.employeeId);
      membership.userIds.forEach(function (userId) {
        if (!userById.has(userId)) {
          const paidTier = demoPaidTierByUser.get(userId) || '';
          userById.set(userId, {
            id: userId,
            name: paidTier ? paidTier + '用户' + userId.slice(1) : '非付费用户' + userId.slice(1),
            rating: paidTier || '非付费',
            paidTier: paidTier,
            ratingBasis: paidTier
              ? '看板演示付费分类，不代表业务正式分层标准，也不由大R名单推导。'
              : '全量私域用户池中的非付费演示样本。',
            projectIds: projectIdsForUser(userId)
          });
        }
        if (!person.privateUserIds.includes(userId)) person.privateUserIds.push(userId);
      });
    });

    demoPaidAssignments.forEach(function (definition) {
      const person = employeeById.get(definition.employeeId);
      definition.assignments.forEach(function (assignment) {
        const userId = assignment[0];
        const status = assignment[1];
        const reasonCode = assignment[2];
        const roleNames = assignment[3];
        const user = userById.get(userId);
        const paidTier = demoPaidTierByUser.get(userId);
        const basis = status === 'unknown'
          ? unknownReasons[reasonCode]
          : status === 'yes'
            ? '演示依据：模拟个微接口确认双方为好友。'
            : '演示依据：模拟个微接口确认双方不是好友。';
        const task = {
          employeeId: person.id,
          employeeName: person.name,
          team: person.team,
          userId: userId,
          userName: user.name,
          rating: paidTier,
          paidTier: paidTier,
          ratingBasis: user.ratingBasis,
          projectIds: user.projectIds,
          status: status,
          basis: basis,
          roleNames: roleNames.slice()
        };
        taskByKey.set(person.id + '|' + userId, task);
      });
    });

    const tasks = Array.from(taskByKey.values());
    tasks.forEach(function (task, index) {
      task.taskDate = '2026-09-' + String(23 + index % 7).padStart(2, '0');
      task.account = 'demo_' + task.userId.toLowerCase();
      task.roleDetails = createRoleDetails(task);
      employeeById.get(task.employeeId).tasks.push(task);
    });
    employees.forEach(function (person) {
      person.tasks.forEach(function (task) {
        if (!person.privateUserIds.includes(task.userId)) person.privateUserIds.push(task.userId);
      });
    });

    const projectById = new Map(demoProjects.map(function (project) {
      return [project.id, project];
    }));
    const projectTasks = [];
    tasks.forEach(function (task) {
      task.projectIds.forEach(function (projectId) {
        projectTasks.push(Object.assign({}, task, {
          projectId: projectId,
          projectName: projectById.get(projectId).name
        }));
      });
    });

    return {
      employees: employees,
      users: Array.from(userById.values()),
      tasks: tasks,
      projects: demoProjects,
      projectTasks: projectTasks
    };
  }

  const demoModel = createDemoModel();

  const demoBusinessRecords = (function createBusinessRecordFixture() {
    const monthlyRechargeTotals = [128600, 136400, 121900, 149200, 161800, 155600];
    const monthlyOrderCounts = [140, 147, 154, 161, 168, 175];
    const monthlyChurnCounts = [34, 30, 39, 28, 25, 31];
    const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
    const daysInMonth = [30, 31, 30, 31, 31, 30];
    const amountOffsets = [-600, -400, -200, 0, 200, 400, 600];
    const addStatuses = ['已添加', '未添加', '待核实'];
    const rechargeOrders = [];
    const churnUsers = [];
    const revisitTasks = [];
    let orderIndex = 0;

    function pad2(value) {
      return String(value).padStart(2, '0');
    }

    function shiftDate(date, offset) {
      const value = new Date(date + 'T00:00:00Z');
      value.setUTCDate(value.getUTCDate() + offset);
      return value.toISOString().slice(0, 10);
    }

    function makeOrder(monthIndex, slot, monthlyRemainder) {
      const amountCount = monthlyOrderCounts[monthIndex];
      const baseAmount = Math.floor(monthlyRechargeTotals[monthIndex] / amountCount);
      const day = slot % daysInMonth[monthIndex] + 1;
      const eventDate = months[monthIndex] + '-' + pad2(day);
      const amount = baseAmount + amountOffsets[slot % amountOffsets.length]
        + (slot < monthlyRemainder ? 1 : 0);
      const employee = demoModel.employees[orderIndex % demoModel.employees.length];
      const project = demoModel.projects[(orderIndex + monthIndex) % demoModel.projects.length];
      const userNumber = orderIndex + 1;
      const userId = 'DEMO-U' + String(userNumber).padStart(5, '0');
      const userName = '演示玩家' + String(userNumber).padStart(4, '0');
      const serverNumber = orderIndex % 8 + 1;
      const rechargeTotal = amount;
      const paidTier = rechargeTotal >= 10000 ? '大R' : rechargeTotal >= 1000 ? '中R' : rechargeTotal > 0 ? '小R' : '';
      const orderTime = eventDate + ' 08:' + pad2(orderIndex * 5 % 60) + ':00';
      const paymentTime = eventDate + ' ' + pad2(9 + orderIndex % 12) + ':'
        + pad2(orderIndex * 7 % 60) + ':' + pad2(orderIndex * 13 % 60);
      const orderNumber = 'DEMO-ORD-' + months[monthIndex].replace('-', '') + '-' + String(slot + 1).padStart(3, '0');
      const serverName = '安卓' + serverNumber + '区';

      const order = {
        recordType: 'recharge',
        recordId: orderNumber,
        orderNumber: orderNumber,
        eventDate: eventDate,
        paidAt: paymentTime,
        order_no: orderNumber,
        cp_order_no: 'DEMO-CP-' + months[monthIndex].replace('-', '') + '-' + String(slot + 1).padStart(3, '0'),
        small_uid: userId,
        user_name: userName,
        role_id: 'DEMO-R' + String(userNumber).padStart(5, '0'),
        role_name: '演示角色' + String(userNumber).padStart(4, '0'),
        game_name: '演示游戏',
        server_name: serverName,
        member_id: 'DEMO-MEMBER-' + String(demoModel.employees.indexOf(employee) + 1).padStart(3, '0'),
        member_name: 'demo_member_' + String(demoModel.employees.indexOf(employee) + 1).padStart(3, '0'),
        order_amount: amount,
        pay_amount: amount,
        order_time: orderTime,
        pay_time: paymentTime,
        project: project.name,
        platform: '演示平台',
        channel: '演示渠道' + String(orderIndex % 3 + 1),
        userId: userId,
        userName: userName,
        account: 'demo_' + userId.toLowerCase(),
        projectId: project.id,
        projectName: project.name,
        employeeId: employee.id,
        employeeName: employee.name,
        maintenanceStaff: employee.name,
        contactStaff: employee.name,
        team: employee.team,
        paidTier: paidTier,
        roleId: 'DEMO-R' + String(userNumber).padStart(5, '0'),
        roleName: '演示角色' + String(userNumber).padStart(4, '0'),
        serverName: serverName,
        amount: amount,
        cumulativeRecharge: rechargeTotal,
        addStatus: addStatuses[userNumber % 100 < 62 ? 0 : userNumber % 100 < 83 ? 1 : 2],
        isDemo: true
      };
      orderIndex += 1;
      return order;
    }

    months.forEach(function (month, monthIndex) {
      const count = monthlyOrderCounts[monthIndex];
      const baseAmount = Math.floor(monthlyRechargeTotals[monthIndex] / count);
      const remainder = monthlyRechargeTotals[monthIndex] - baseAmount * count;
      for (let slot = 0; slot < count; slot += 1) {
        rechargeOrders.push(makeOrder(monthIndex, slot, remainder));
      }
    });

    let churnIndex = 0;
    months.forEach(function (month, monthIndex) {
      const count = monthlyChurnCounts[monthIndex];
      for (let slot = 0; slot < count; slot += 1) {
        const source = rechargeOrders[(churnIndex * 5) % rechargeOrders.length];
        const day = slot % daysInMonth[monthIndex] + 1;
        const churnDate = month + '-' + pad2(day);
        const lastLoginAt = shiftDate(churnDate, -(30 + churnIndex % 55));
        churnUsers.push({
          recordType: 'churn',
          recordId: 'DEMO-LOSS-' + String(churnIndex + 1).padStart(4, '0'),
          eventDate: churnDate,
          churnDate: churnDate,
          userId: source.userId,
          userName: source.userName,
          account: source.account,
          projectId: source.projectId,
          projectName: source.projectName,
          employeeName: source.employeeName,
          maintenanceStaff: source.maintenanceStaff,
          team: source.team,
          paidTier: source.paidTier,
          roleId: source.roleId,
          roleName: source.roleName,
          serverName: source.serverName,
          lastLoginAt: lastLoginAt,
          paidTierLabel: source.paidTier || '空值',
          cumulativeRecharge: source.cumulativeRecharge,
          churnBasis: '演示流失记录：最后登录早于流失日期至少30天。',
          playerStatus: '流失演示',
          isDemo: true
        });
        churnIndex += 1;
      }
    });

    const visitStatuses = ['已回访', '未回访', '待回访'];
    for (let index = 0; index < 100; index += 1) {
      const source = rechargeOrders[(index * 17) % rechargeOrders.length];
      const monthIndex = index % months.length;
      const day = Math.floor(index / months.length) % daysInMonth[monthIndex] + 1;
      const taskDate = months[monthIndex] + '-' + pad2(day);
      const status = index < 58 ? visitStatuses[0] : index < 83 ? visitStatuses[1] : visitStatuses[2];
      revisitTasks.push({
        recordType: 'revisit',
        recordId: 'DEMO-VISIT-' + String(index + 1).padStart(4, '0'),
        taskNumber: 'DEMO-VISIT-' + String(index + 1).padStart(4, '0'),
        taskDate: taskDate,
        eventDate: taskDate,
        userId: source.userId,
        userName: source.userName,
        account: source.account,
        projectId: source.projectId,
        projectName: source.projectName,
        employeeName: source.employeeName,
        maintenanceStaff: source.maintenanceStaff,
        team: source.team,
        paidTier: source.paidTier,
        roleId: source.roleId,
        roleName: source.roleName,
        serverName: source.serverName,
        revisitTime: status === '已回访' ? taskDate + ' ' + pad2(10 + index % 8) + ':' + pad2(index * 11 % 60) : '',
        revisitStatus: status,
        revisitResult: status === '已回访' ? '已完成近况确认并记录需求' : status === '未回访' ? '暂未联系到玩家' : '待安排回访',
        isDemo: true
      });
    }

    return {
      rechargeOrders: rechargeOrders,
      churnUsers: churnUsers,
      revisitTasks: revisitTasks
    };
  })();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function formatCount(value) {
    return Number(value).toLocaleString('zh-CN');
  }

  function formatCurrency(value) {
    return '¥' + Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
  }

  function formatRate(rate) {
    return rate == null ? '—' : (rate * 100).toFixed(1) + '%';
  }

  function summarize(tasks) {
    const result = {
      required: tasks.length,
      covered: 0,
      uncovered: 0,
      unknown: 0
    };
    tasks.forEach(function (task) {
      if (task.status === 'yes') result.covered += 1;
      else if (task.status === 'no') result.uncovered += 1;
      else result.unknown += 1;
    });
    result.rate = result.required ? result.covered / result.required : null;
    return result;
  }

  function uniqueUserCount(tasks) {
    return new Set(tasks.map(function (task) {
      return task.userId;
    })).size;
  }

  function privatePoolUserCount(people, projectId) {
    const userIds = new Set();
    const projectIdsByUser = new Map(demoModel.users.map(function (user) {
      return [user.id, user.projectIds];
    }));
    people.forEach(function (person) {
      person.privateUserIds.forEach(function (userId) {
        if (!projectId || projectIdsByUser.get(userId).includes(projectId)) {
          userIds.add(userId);
        }
      });
    });
    return userIds.size;
  }

  function mount(root) {
    const scope = root || document;
    const find = function (id) {
      return scope.querySelector('#' + id);
    };
    const nodes = {
      summaryCards: find('summaryCards'),
      projectFilter: find('projectFilter'),
      paidTierFilter: find('paidTierFilter'),
      teamFilter: find('teamFilter'),
      staffSearch: find('staffSearch'),
      dateStart: find('dateStart'),
      dateEnd: find('dateEnd'),
      dateRangeHint: find('dateRangeHint'),
      resetDateRange: find('resetDateRange'),
      dimensionTabs: find('dimensionTabs'),
      rankingRows: find('rankingRows'),
      rankingHead: find('rankingHead'),
      coverageChart: find('coverageChart'),
      rechargeTrendChart: find('rechargeTrendChart'),
      churnTrendChart: find('churnTrendChart'),
      churnPaymentPieChart: find('churnPaymentPieChart'),
      rechargeTierPieChart: find('rechargeTierPieChart'),
      rechargeCoveragePieChart: find('rechargeCoveragePieChart'),
      revisitPieChart: find('revisitPieChart'),
      serverRechargeBarChart: find('serverRechargeBarChart'),
      chartDetailDialog: find('chartDetailDialog'),
      chartDetailTitle: find('chartDetailTitle'),
      chartDetailMeta: find('chartDetailMeta'),
      chartDetailHead: find('chartDetailHead'),
      chartDetailRows: find('chartDetailRows'),
      chartDetailSummary: find('chartDetailSummary'),
      chartDetailPageSize: find('chartDetailPageSize'),
      chartDetailPageInfo: find('chartDetailPageInfo'),
      chartDetailFirst: find('chartDetailFirst'),
      chartDetailPrevious: find('chartDetailPrevious'),
      chartDetailNext: find('chartDetailNext'),
      chartDetailLast: find('chartDetailLast'),
      closeChartDetail: find('closeChartDetail'),
      chartDetailButtons: scope.querySelectorAll
        ? scope.querySelectorAll('[data-chart-detail]')
        : [],
      rechargeTierSelect: find('rechargeTierSelect'),
      coverageDetailCount: find('coverageDetailCount'),
      coverageDetailRows: find('coverageDetailRows'),
      detailDialog: find('detailDialog'),
      detailTitle: find('detailTitle'),
      detailMeta: find('detailMeta'),
      detailSummary: find('detailSummary'),
      detailStatusFilter: find('detailStatusFilter'),
      detailRows: find('detailRows'),
      closeDetail: find('closeDetail'),
      projectDetailDialog: find('projectDetailDialog'),
      openProjectDetails: find('openProjectDetails'),
      closeProjectDetail: find('closeProjectDetail'),
      sourceStatus: find('sourceStatus')
    };

    const optionalNodes = new Set([
      'paidTierFilter',
      'detailSummary',
      'detailStatusFilter',
      'projectDetailDialog',
      'openProjectDetails',
      'closeProjectDetail',
      'coverageChart',
      'rechargeTrendChart',
      'churnTrendChart',
      'churnPaymentPieChart',
      'rechargeTierPieChart',
      'rechargeCoveragePieChart',
      'revisitPieChart',
      'serverRechargeBarChart',
      'chartDetailDialog',
      'chartDetailTitle',
      'chartDetailMeta',
      'chartDetailHead',
      'chartDetailRows',
      'closeChartDetail',
      'chartDetailButtons',
      'rechargeTierSelect'
    ]);
    if (Object.keys(nodes).some(function (key) {
      return !optionalNodes.has(key) && !nodes[key];
    })) return null;

    let dimension = 'staff';
    let currentRankings = [];
    const chartInstances = new Map();
    const chartDetailData = new Map();
    let activeChartDetail = null;
    const teams = Array.from(new Set(demoModel.employees.map(function (person) {
      return person.team;
    }))).sort(function (a, b) {
      return a.localeCompare(b, 'zh-CN');
    });

    function fillProjectFilter() {
      const previousValue = nodes.projectFilter.value;
      nodes.projectFilter.replaceChildren();
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = '全部项目';
      nodes.projectFilter.appendChild(allOption);
      demoModel.projects.forEach(function (project) {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        nodes.projectFilter.appendChild(option);
      });
      nodes.projectFilter.value = demoModel.projects.some(function (project) {
        return project.id === previousValue;
      }) ? previousValue : '';
    }

    function selectedProjectId() {
      return nodes.projectFilter.value;
    }

    function selectedPaidTier() {
      if (!nodes.paidTierFilter) return '';
      return ['大R', '中R', '小R'].includes(nodes.paidTierFilter.value)
        ? nodes.paidTierFilter.value
        : '';
    }

    function matchesPaidTier(task) {
      const paidTier = selectedPaidTier();
      return !paidTier || task.paidTier === paidTier;
    }

    function dateRangeIsValid() {
      return !nodes.dateStart.value || !nodes.dateEnd.value || nodes.dateStart.value <= nodes.dateEnd.value;
    }

    function matchesDateRange(date) {
      if (!dateRangeIsValid()) return false;
      const value = String(date || '').slice(0, 10);
      return Boolean(value)
        && (!nodes.dateStart.value || value >= nodes.dateStart.value)
        && (!nodes.dateEnd.value || value <= nodes.dateEnd.value);
    }

    function currentDateScopeText() {
      const start = nodes.dateStart.value || '不限';
      const end = nodes.dateEnd.value || '不限';
      return start === '不限' && end === '不限' ? '全部日期' : start + ' 至 ' + end;
    }

    function dateRangeSpanDays() {
      if (!dateRangeIsValid()) return 0;
      if (!nodes.dateStart.value || !nodes.dateEnd.value) return 100000;
      return Math.floor((Date.parse(nodes.dateEnd.value + 'T00:00:00Z')
        - Date.parse(nodes.dateStart.value + 'T00:00:00Z')) / 86400000);
    }

    function matchesBusinessFilters(record) {
      const team = nodes.teamFilter.value;
      const search = nodes.staffSearch.value.trim().toLocaleLowerCase('zh-CN');
      return dateRangeIsValid()
        && matchesDateRange(record.eventDate)
        && (!selectedProjectId() || record.projectId === selectedProjectId())
        && (!selectedPaidTier() || record.paidTier === selectedPaidTier())
        && (!team || record.team === team)
        && (!search || record.employeeName.toLocaleLowerCase('zh-CN').includes(search));
    }

    function fillTeamFilter() {
      const previousValue = nodes.teamFilter.value;
      nodes.teamFilter.replaceChildren();
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = '全部分组';
      nodes.teamFilter.appendChild(allOption);
      teams.forEach(function (team) {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        nodes.teamFilter.appendChild(option);
      });
      nodes.teamFilter.value = teams.includes(previousValue) ? previousValue : '';
    }

    function scopedEmployees() {
      const team = nodes.teamFilter.value;
      const search = nodes.staffSearch.value.trim().toLocaleLowerCase('zh-CN');
      return demoModel.employees.filter(function (person) {
        const matchesTeam = !team || person.team === team;
        const matchesSearch = !search || person.name.toLocaleLowerCase('zh-CN').includes(search);
        return matchesTeam && matchesSearch;
      });
    }

    function employeeTasksFor(person) {
      const projectId = selectedProjectId();
      return person.tasks.filter(function (task) {
        return matchesPaidTier(task)
          && matchesDateRange(task.taskDate)
          && (!projectId || task.projectIds.includes(projectId));
      });
    }

    function globalTasksFor(people) {
      return people.reduce(function (all, person) {
        return all.concat(employeeTasksFor(person));
      }, []);
    }

    function tasksForDimension(people, globalTasks) {
      if (dimension !== 'project') return globalTasks;
      const employeeIds = new Set(people.map(function (person) { return person.id; }));
      const projectId = selectedProjectId();
      return demoModel.projectTasks.filter(function (task) {
        return employeeIds.has(task.employeeId)
          && matchesPaidTier(task)
          && matchesDateRange(task.taskDate)
          && (!projectId || task.projectId === projectId);
      });
    }

    function buildRankings(people) {
      let rankings;
      if (dimension === 'project') {
        const employeeIds = new Set(people.map(function (person) { return person.id; }));
        const projectId = selectedProjectId();
        rankings = demoModel.projects.filter(function (project) {
          return !projectId || project.id === projectId;
        }).map(function (project) {
          return {
            kind: 'project',
            name: project.name,
            employees: people,
            tasks: demoModel.projectTasks.filter(function (task) {
              return task.projectId === project.id
                && employeeIds.has(task.employeeId)
                && matchesPaidTier(task)
                && matchesDateRange(task.taskDate);
            })
          };
        }).filter(function (ranking) {
          return ranking.tasks.length > 0;
        });
      } else if (dimension === 'group') {
        const byTeam = new Map();
        people.forEach(function (person) {
          if (!byTeam.has(person.team)) {
            byTeam.set(person.team, {
              kind: 'group',
              name: person.team,
              employees: [],
              tasks: []
            });
          }
          const group = byTeam.get(person.team);
          group.employees.push(person);
          group.tasks.push.apply(group.tasks, employeeTasksFor(person));
        });
        rankings = Array.from(byTeam.values());
      } else {
        rankings = people.map(function (person) {
          return {
            kind: 'staff',
            name: person.name,
            employees: [person],
            tasks: employeeTasksFor(person)
          };
        });
      }

      rankings.forEach(function (ranking) {
        ranking.stats = summarize(ranking.tasks);
      });
      rankings.sort(function (a, b) {
        return b.stats.uncovered - a.stats.uncovered
          || b.stats.unknown - a.stats.unknown
          || (a.stats.rate == null ? 1 : a.stats.rate) - (b.stats.rate == null ? 1 : b.stats.rate)
          || a.name.localeCompare(b.name, 'zh-CN');
      });
      return rankings;
    }

    function renderSummary(tasks) {
      const stats = summarize(tasks);
      const rate = formatRate(stats.rate);
      const percent = stats.rate == null ? 0 : Math.max(0, Math.min(100, stats.rate * 100));
      const orders = recordsForChart('rechargeTrendChart');
      const rechargeTotal = orders.reduce(function (total, record) { return total + record.amount; }, 0);
      const rechargeUsers = new Set(orders.map(function (record) { return record.userId; })).size;
      const tierLabel = selectedPaidTier() || '全部付费用户';
      const statusCard = function (status, label, value, note) {
        return '<button type="button" class="summary-support-item" data-detail-status="' + status + '"'
          + ' aria-label="查看' + label + '任务明细，共' + formatCount(value) + '项">'
          + '<span class="summary-support-label">' + label + '</span>'
          + '<strong class="summary-support-value">' + formatCount(value) + '</strong>'
          + '<span class="summary-support-link">查看明细</span>'
          + '<small>' + note + '</small></button>';
      };
      const metricCard = function (label, value, note) {
        return '<div class="summary-support-item summary-business-metric">'
          + '<span class="summary-support-label">' + label + '</span>'
          + '<strong class="summary-support-value">' + value + '</strong>'
          + '<small>' + note + '</small></div>';
      };

      nodes.summaryCards.innerHTML = '<article class="coverage-hero">'
        + '<div class="coverage-hero-main">'
        + '<span class="coverage-hero-label">' + escapeHtml(tierLabel) + '好友覆盖率</span>'
        + '<strong class="coverage-hero-value">' + escapeHtml(rate) + '</strong>'
        + '<div class="coverage-hero-count">已覆盖 '
        + '<button type="button" data-detail-status="yes" aria-label="查看已覆盖明细，共' + formatCount(stats.covered) + '项">'
        + formatCount(stats.covered) + '</button>'
        + ' / 应覆盖 <strong>' + formatCount(stats.required) + '</strong> 项员工 × 用户任务</div>'
        + '</div>'
        + '<div class="coverage-ring" style="--coverage-percent:' + percent.toFixed(1) + '%" role="img"'
        + ' aria-label="付费用户覆盖率 ' + escapeHtml(rate) + '">'
        + '<strong>' + escapeHtml(rate) + '</strong><span>覆盖率</span></div>'
        + '</article>'
        + '<div class="summary-support">'
        + statusCard('no', '确认未覆盖', stats.uncovered, '好友关系已确认未建立')
        + statusCard('unknown', '待核实', stats.unknown, '不计入确认未覆盖')
        + metricCard('充值总额', formatCurrency(rechargeTotal), '经营统计 · 按支付时间汇总')
        + metricCard('充值人数', formatCount(rechargeUsers), '经营统计 · 按用户编号去重')
        + '</div>';
    }

    function renderRankingHead() {
      let row = nodes.rankingHead.tagName.toLowerCase() === 'tr'
        ? nodes.rankingHead
        : nodes.rankingHead.querySelector('tr');
      if (!row) {
        row = document.createElement('tr');
        nodes.rankingHead.replaceChildren(row);
      }
      const firstHeading = dimension === 'project'
        ? '项目'
        : dimension === 'group'
          ? '分组'
          : '员工';
      row.innerHTML = '<th scope="col">' + escapeHtml(firstHeading) + '</th>'
        + '<th scope="col">应覆盖</th>'
        + '<th scope="col">已覆盖</th>'
        + '<th scope="col">确认未覆盖</th>'
        + '<th scope="col">待核实</th>'
        + '<th scope="col">覆盖率</th>';
    }

    function renderRankingRows() {
      if (!currentRankings.length) {
        nodes.rankingRows.innerHTML = '<tr><td class="brc-table-empty" colspan="6">当前筛选范围暂无付费用户任务</td></tr>';
        return;
      }
      nodes.rankingRows.innerHTML = currentRankings.map(function (ranking, index) {
        const stats = ranking.stats;
        const rate = formatRate(stats.rate);
        const kind = ranking.kind === 'project'
          ? '项目'
          : ranking.kind === 'group'
            ? '分组'
            : '员工';
        const label = '查看' + kind + ' ' + ranking.name + ' 的付费用户任务';
        return '<tr class="ranking-row" data-rank-index="' + index + '" tabindex="0" aria-label="' + escapeHtml(label) + '">'
          + '<th scope="row">' + escapeHtml(ranking.name) + '</th>'
          + '<td>' + formatCount(stats.required) + '</td>'
          + '<td>' + formatCount(stats.covered) + '</td>'
          + '<td>' + formatCount(stats.uncovered) + '</td>'
          + '<td>' + formatCount(stats.unknown) + '</td>'
          + '<td>' + escapeHtml(rate) + '</td>'
          + '</tr>';
      }).join('');
    }

    function renderCoverageChart() {
      if (!nodes.coverageChart) return;
      if (!currentRankings.length) {
        nodes.coverageChart.innerHTML = '<div class="brc-empty">当前筛选范围暂无付费用户任务</div>';
        return;
      }
      nodes.coverageChart.innerHTML = currentRankings.map(function (ranking, index) {
        const stats = ranking.stats;
        const coveredPercent = stats.required ? stats.covered / stats.required * 100 : 0;
        const uncoveredPercent = stats.required ? stats.uncovered / stats.required * 100 : 0;
        const pendingPercent = stats.required ? stats.unknown / stats.required * 100 : 0;
        const percent = stats.rate == null ? 0 : Math.max(0, Math.min(100, coveredPercent));
        const kind = ranking.kind === 'project'
          ? '项目'
          : ranking.kind === 'group'
            ? '分组'
            : '员工';
        const accessibleLabel = kind + ' ' + ranking.name + '，已覆盖 '
          + stats.covered + '，确认未覆盖 ' + stats.uncovered
          + '，待核实 ' + stats.unknown + '，应覆盖 ' + stats.required;
        const rate = formatRate(stats.rate);
        return '<button type="button" class="brc-coverage-row" data-rank-index="' + index + '" aria-label="' + escapeHtml(accessibleLabel) + '"'
          + ' style="width:100%;border:0;background:transparent;padding:0;text-align:left;color:inherit;font:inherit;cursor:pointer">'
          + '<span class="brc-coverage-name">' + escapeHtml(ranking.name) + '</span>'
          + '<span class="brc-coverage-track" role="progressbar" aria-label="' + escapeHtml(kind + ' ' + ranking.name + ' 覆盖率') + '"'
          + ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percent.toFixed(1) + '">'
          + '<span class="brc-coverage-segment is-covered" style="width:' + coveredPercent.toFixed(1) + '%"></span>'
          + '<span class="brc-coverage-segment is-uncovered" style="width:' + uncoveredPercent.toFixed(1) + '%"></span>'
          + '<span class="brc-coverage-segment is-pending" style="width:' + pendingPercent.toFixed(1) + '%"></span>'
          + '</span>'
          + '<span class="brc-coverage-meta"><strong>覆盖率 ' + escapeHtml(rate) + ' · 已覆盖 '
          + formatCount(stats.covered) + ' / ' + formatCount(stats.required) + '</strong>'
          + '<span>确认未覆盖 ' + formatCount(stats.uncovered) + ' · 待核实 ' + formatCount(stats.unknown) + '</span></span>'
          + '</button>';
      }).join('');
    }


    function chartTotal(rows) {
      return rows.reduce(function (total, row) { return total + Number(row.value || 0); }, 0);
    }

    function chartRowsWithShare(rows) {
      const total = chartTotal(rows);
      return rows.map(function (row) {
        return Object.assign({}, row, { share: total ? Number(row.value || 0) / total : 0 });
      });
    }

    function chartDescription(title, rows, valueLabel) {
      return title + '，演示记录汇总。' + (rows.length
        ? rows.map(function (row) {
          return row.name + ' ' + valueLabel(row) + '，占比 ' + formatRate(row.share);
        }).join('；')
        : '当前筛选范围暂无记录');
    }

    function getDemoChart(key) {
      const node = nodes[key];
      if (!node || !window.echarts) return null;
      let chart = chartInstances.get(key) || window.echarts.getInstanceByDom(node);
      if (!chart) chart = window.echarts.init(node, null, { renderer: 'canvas', locale: 'ZH' });
      chartInstances.set(key, chart);
      return chart;
    }

    function setChartAccessibility(node, description) {
      if (node) node.setAttribute('aria-label', description);
    }

    function tooltipBox(title, lines) {
      return '<div style="min-width:140px;color:#243247">'
        + '<strong style="display:block;margin-bottom:5px">' + escapeHtml(title) + '</strong>'
        + lines.map(function (line) {
          return '<div style="line-height:1.65">' + escapeHtml(line) + '</div>';
        }).join('') + '</div>';
    }

    function chartRecordType(key) {
      if (key === 'churnTrendChart' || key === 'churnPaymentPieChart') return 'churnUsers';
      if (key === 'revisitPieChart') return 'revisitTasks';
      return 'rechargeOrders';
    }

    function recordsForChart(key) {
      let records = demoBusinessRecords[chartRecordType(key)].filter(matchesBusinessFilters);
      if (key === 'rechargeTierPieChart') {
        const threshold = Number(nodes.rechargeTierSelect && nodes.rechargeTierSelect.value || 500);
        records = records.filter(function (record) { return Number(record.pay_amount) >= threshold; });
      }
      return records;
    }

    function bucketFilterFor(row, field) {
      if (field === 'eventMonth') return { kind: 'month', value: row.name };
      if (field === 'eventDate') return { kind: 'day', value: row.name };
      return { kind: 'value', field: field, value: row.name };
    }

    function groupRecords(records, field, metric, colorSet) {
      const groups = new Map();
      records.forEach(function (record) {
        const name = field === 'eventMonth'
          ? record.eventDate.slice(0, 7)
          : field === 'eventDate'
            ? record.eventDate
            : (record[field] || '空值');
        if (!groups.has(name)) {
          groups.set(name, {
            name: name,
            value: 0,
            count: 0,
            amount: 0,
            records: [],
            bucketFilter: bucketFilterFor({ name: name }, field)
          });
        }
        const group = groups.get(name);
        group.count += 1;
        group.amount += Number(record.pay_amount || 0);
        group.value += metric === 'amount' ? Number(record.pay_amount || 0) : 1;
        group.records.push(record);
      });
      const rows = Array.from(groups.values());
      rows.forEach(function (row, index) {
        row.color = colorSet[index % colorSet.length];
      });
      return chartRowsWithShare(rows);
    }

    function businessDateBasis(key) {
      if (key === 'churnTrendChart' || key === 'churnPaymentPieChart') return '流失日期';
      if (key === 'revisitPieChart') return '回访任务日期';
      return '支付日期';
    }

    function renderRecordFacts(facts) {
      return facts.filter(function (fact) {
        return fact[1] !== null && fact[1] !== undefined && fact[1] !== '';
      }).map(function (fact) {
        return '<div class="brc-user-meta"><span class="brc-user-label">'
          + escapeHtml(fact[0]) + '：</span>' + escapeHtml(fact[1]) + '</div>';
      }).join('');
    }

    function renderBusinessRecordRow(key, record) {
      if (chartRecordType(key) === 'rechargeOrders') {
        const rechargeCells = rechargeDetailFields.map(function (field) {
          const rawValue = record[field.key];
          const value = rawValue === null || rawValue === undefined || rawValue === ''
            ? '—'
            : field.currency ? formatCurrency(rawValue) : rawValue;
          return '<td>' + escapeHtml(value) + '</td>';
        });
        if (key === 'rechargeCoveragePieChart') {
          rechargeCells.push('<td>' + escapeHtml(record.addStatus || '—') + '</td>');
        }
        return '<tr>' + rechargeCells.join('') + '</tr>';
      }

      const isChurn = key === 'churnTrendChart' || key === 'churnPaymentPieChart';
      const cells = isChurn
        ? [record.userName + '（' + record.userId + '） · 角色 ID：' + record.roleId + ' · 角色名：' + record.roleName,
          record.projectName, record.maintenanceStaff + '（' + record.team + '）', record.serverName,
          record.churnDate, record.lastLoginAt, record.paidTierLabel,
          formatCurrency(record.cumulativeRecharge), record.playerStatus, record.churnBasis]
        : [record.taskNumber, record.userName + '（' + record.userId + '） · 角色 ID：' + record.roleId + ' · 角色名：' + record.roleName,
          record.projectName, record.maintenanceStaff + '（' + record.team + '）', record.serverName,
          record.taskDate, record.revisitTime || '—', record.revisitStatus, record.revisitResult];
      return '<tr>' + cells.map(function (value) {
        return '<td>' + escapeHtml(value || '—') + '</td>';
      }).join('') + '</tr>';
    }

    function chartDetailRecords(active) {
      const records = recordsForChart(active.key);
      if (!active.bucketFilter) return records;
      const bucket = active.bucketFilter;
      return records.filter(function (record) {
        if (bucket.kind === 'month') return record.eventDate.slice(0, 7) === bucket.value;
        if (bucket.kind === 'day') return record.eventDate === bucket.value;
        return record[bucket.field] === bucket.value;
      });
    }

    function renderChartDetailContent() {
      if (!activeChartDetail) return;
      const active = activeChartDetail;
      const definition = chartDetailData.get(active.key);
      if (!definition) return;
      const records = chartDetailRecords(active).slice().sort(function (a, b) {
        return b.eventDate.localeCompare(a.eventDate) || b.recordId.localeCompare(a.recordId);
      });
      const pageSize = Number(nodes.chartDetailPageSize.value) === 50 ? 50 : 20;
      const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
      active.page = Math.min(active.page, pageCount);
      const offset = (active.page - 1) * pageSize;
      const pageRows = records.slice(offset, offset + pageSize);
      const isRecharge = chartRecordType(active.key) === 'rechargeOrders';
      const amountTotal = records.reduce(function (total, record) {
        return total + Number(record.pay_amount || 0);
      }, 0);
      const userCount = new Set(records.map(function (record) { return record.userId; })).size;
      const countLabel = active.key === 'revisitPieChart' ? '条回访任务' : isRecharge ? '笔订单' : '条流失记录';
      const summaryParts = ['共 ' + formatCount(records.length) + ' ' + countLabel];
      if (isRecharge) {
        summaryParts.push('充值金额 ' + formatCurrency(amountTotal));
        summaryParts.push('充值人数 ' + formatCount(userCount));
      } else {
        summaryParts.push('涉及用户 ' + formatCount(userCount));
      }
      nodes.chartDetailSummary.textContent = summaryParts.join(' · ');
      nodes.chartDetailMeta.textContent = '演示底层记录 · 日期口径：' + businessDateBasis(active.key)
        + ' · ' + currentDateScopeText()
        + (active.bucketFilter ? ' · 已按图表所选' + active.bucketFilter.value + '缩小范围' : ' · 当前全局筛选范围');
      const firstRow = records.length ? offset + 1 : 0;
      const lastRow = Math.min(offset + pageSize, records.length);
      const headers = isRecharge
        ? rechargeDetailFields.map(function (field) { return field.label; })
        : active.key === 'revisitPieChart'
          ? ['任务编号', '用户及角色', '归属项目', '维护人员', '区服', '任务日期', '回访时间', '回访状态', '回访结果/依据']
          : ['用户及角色', '归属项目', '维护人员', '区服', '流失日期', '最后登录时间', '付费分类', '累计充值', '流失状态', '状态依据'];
      if (active.key === 'rechargeCoveragePieChart') headers.push('覆盖状态');
      nodes.chartDetailHead.innerHTML = headers.map(function (label) {
        return '<th scope="col">' + escapeHtml(label) + '</th>';
      }).join('');
      nodes.chartDetailRows.closest('table').classList.toggle('brc-detail-table--recharge', isRecharge);
      nodes.chartDetailPageInfo.textContent = '第 ' + active.page + ' / ' + pageCount + ' 页 · '
        + (records.length ? firstRow + '–' + lastRow + ' 条' : '0 条')
        + ' · 共 ' + formatCount(records.length) + ' 条';
      nodes.chartDetailRows.innerHTML = pageRows.length
        ? pageRows.map(function (record) { return renderBusinessRecordRow(active.key, record); }).join('')
        : '<tr><td class="brc-table-empty" colspan="' + headers.length + '">当前筛选范围暂无对应记录</td></tr>';
      nodes.chartDetailFirst.disabled = active.page <= 1;
      nodes.chartDetailPrevious.disabled = active.page <= 1;
      nodes.chartDetailNext.disabled = active.page >= pageCount;
      nodes.chartDetailLast.disabled = active.page >= pageCount;
    }

    function openChartDetail(key, bucketFilter) {
      const definition = chartDetailData.get(key);
      if (!definition) return;
      activeChartDetail = { key: key, bucketFilter: bucketFilter || null, page: 1 };
      nodes.chartDetailTitle.textContent = definition.title + ' · 明细';
      renderChartDetailContent();
      showDialog(nodes.chartDetailDialog);
    }

    const chartClickHandlers = new WeakMap();
    const zrenderClickHandlers = new WeakMap();

    function bindChartDetail(chart, key) {
      const previousHandler = chartClickHandlers.get(chart);
      if (previousHandler) chart.off('click', previousHandler);
      const handler = function (params) {
        const bucketFilter = params.data && params.data.bucketFilter;
        if (bucketFilter) openChartDetail(key, bucketFilter);
      };
      chartClickHandlers.set(chart, handler);
      chart.on('click', handler);
    }

    function bindLineChartDetail(chart, key, rows) {
      const zr = chart.getZr();
      const previousHandler = zrenderClickHandlers.get(chart);
      if (previousHandler) zr.off('click', previousHandler);
      const handler = function (event) {
        const pixel = [event.offsetX, event.offsetY];
        if (!chart.containPixel({ gridIndex: 0 }, pixel)) return;
        const coordinates = chart.convertFromPixel({ gridIndex: 0 }, pixel);
        const index = Math.round(Array.isArray(coordinates) ? coordinates[0] : coordinates);
        if (!Number.isFinite(index) || index < 0 || index >= rows.length || !rows[index].bucketFilter) return;
        openChartDetail(key, rows[index].bucketFilter);
      };
      zrenderClickHandlers.set(chart, handler);
      zr.on('click', handler);
    }

    function renderDemoLineChart(key, title, rows, seriesName, unit, color) {
      const node = nodes[key];
      if (!node) return;
      const valueLabel = function (row) {
        return unit === '¥' ? formatCurrency(row.value) : formatCount(row.value) + unit;
      };
      const description = chartDescription(title, rows, valueLabel);
      setChartAccessibility(node, description);
      chartDetailData.set(key, { title: title });
      const chart = getDemoChart(key);
      if (!chart) return;
      chart.setOption({
        animationDuration: 240,
        color: [color],
        aria: { show: true, description: description },
        tooltip: {
          trigger: 'axis',
          confine: true,
          axisPointer: { type: 'line', lineStyle: { color: '#99a8ba', type: 'dashed' } },
          backgroundColor: '#ffffff',
          borderColor: '#dce3ed',
          borderWidth: 1,
          padding: [9, 12],
          textStyle: { color: '#243247', fontSize: 12 },
          extraCssText: 'box-shadow:0 8px 24px rgba(24,45,78,.12);border-radius:8px',
          formatter: function (params) {
            const points = Array.isArray(params) ? params : [params];
            const point = points[0];
            const row = rows[point.dataIndex];
            return tooltipBox(point.axisValueLabel || point.axisValue, [
              seriesName + '：' + valueLabel(row),
              '占本期总量：' + formatRate(row.share)
            ]);
          }
        },
        grid: { left: 60, right: 24, top: 24, bottom: 36, containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: rows.map(function (row) { return row.name; }),
          axisTick: { alignWithLabel: true },
          axisLine: { lineStyle: { color: '#d7deea' } },
          axisLabel: { color: '#718096', hideOverlap: true }
        },
        yAxis: {
          type: 'value',
          min: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#718096',
            formatter: unit === '¥'
              ? function (value) { return value >= 10000 ? '¥' + (value / 10000).toFixed(0) + '万' : formatCurrency(value); }
              : function (value) { return formatCount(value) + unit; }
          },
          splitLine: { lineStyle: { color: '#edf1f6' } }
        },
        series: [{
          name: seriesName,
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 7,
          data: rows.map(function (row) {
            return { value: row.value, share: row.share, bucketFilter: row.bucketFilter };
          }),
          lineStyle: { width: 3, color: color },
          itemStyle: { color: color, borderColor: '#ffffff', borderWidth: 2 },
          areaStyle: { color: color === demoChartColors.recharge ? 'rgba(22,119,255,.10)' : 'rgba(229,138,58,.10)' },
          emphasis: { focus: 'series', scale: true }
        }]
      }, { notMerge: true });
      bindLineChartDetail(chart, key, rows);
    }

    function renderDemoPieChart(key, title, rows, detailField, colors) {
      const node = nodes[key];
      if (!node) return;
      rows.forEach(function (row, index) {
        row.index = index;
        row.color = colors[index % colors.length];
      });
      const valueLabel = function (row) {
        if (row.count != null) return formatCount(row.count) + '人'
          + (row.amount ? ' ' + formatCurrency(row.amount) : '');
        return formatCurrency(row.value);
      };
      const description = chartDescription(title, rows, valueLabel);
      setChartAccessibility(node, description);
      chartDetailData.set(key, { title: title });
      const chart = getDemoChart(key);
      if (!chart) return;
      const total = chartTotal(rows);
      chart.setOption({
        animationDuration: 240,
        color: rows.map(function (row) { return row.color; }),
        aria: { show: true, description: description },
        tooltip: {
          trigger: 'item',
          confine: true,
          backgroundColor: '#ffffff',
          borderColor: '#dce3ed',
          borderWidth: 1,
          padding: [9, 12],
          textStyle: { color: '#243247', fontSize: 12 },
          extraCssText: 'box-shadow:0 8px 24px rgba(24,45,78,.12);border-radius:8px',
          formatter: function (params) {
            const row = params.data;
            const lines = [];
            if (row.count != null) lines.push('记录数：' + formatCount(row.count));
            if (row.amount > 0) lines.push('金额：' + formatCurrency(row.amount));
            if (row.count == null) lines.push('金额：' + formatCurrency(row.value));
            lines.push('占比：' + formatRate(row.share));
            return tooltipBox(params.name, lines);
          }
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 8,
          top: 'middle',
          bottom: 8,
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          pageIconColor: '#68788f',
          pageTextStyle: { color: '#718096' },
          textStyle: { color: '#526176', fontSize: 12 },
          formatter: function (name) {
            const row = rows.find(function (item) { return item.name === name; });
            return row ? name + '  ' + valueLabel(row) + '  ' + formatRate(row.share) : name;
          }
        },
        series: [{
          type: 'pie',
          name: title,
          radius: ['40%', '66%'],
          center: ['32%', '52%'],
          selectedMode: false,
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#ffffff', borderWidth: 2, borderRadius: 3 },
          emphasis: {
            scale: false,
            focus: 'none',
            itemStyle: { borderColor: '#ffffff', borderWidth: 2, shadowBlur: 0 },
            label: { show: false }
          },
          blur: { itemStyle: { opacity: 1 } },
          data: rows.map(function (row) {
            return Object.assign({}, row, { bucketFilter: bucketFilterFor(row, detailField) });
          })
        }],
        graphic: total ? [] : [{
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: '暂无匹配记录', fill: '#718096', fontSize: 13 }
        }]
      }, { notMerge: true });
      bindChartDetail(chart, key);
    }

    function renderRechargeTierPie() {
      const selectedThreshold = Number(nodes.rechargeTierSelect && nodes.rechargeTierSelect.value || 500);
      const records = recordsForChart('rechargeTierPieChart');
      const span = dateRangeSpanDays();
      const groupField = span <= 31 ? 'eventDate' : 'eventMonth';
      const rows = groupRecords(records, groupField, 'amount', demoChartColors.categories);
      const title = '充值分层占比 · 单笔实付金额门槛 ¥' + formatCount(selectedThreshold);
      renderDemoPieChart('rechargeTierPieChart', title, rows, groupField, demoChartColors.categories);
    }

    function renderServerRechargeBar() {
      const records = recordsForChart('serverRechargeBarChart');
      const rows = groupRecords(records, 'serverName', 'amount', [demoChartColors.server]);
      const node = nodes.serverRechargeBarChart;
      if (!node) return;
      const description = chartDescription('充值用户区服分布', rows, function (row) {
        return formatCurrency(row.value);
      });
      setChartAccessibility(node, description);
      chartDetailData.set('serverRechargeBarChart', { title: '充值用户区服分布' });
      const chart = getDemoChart('serverRechargeBarChart');
      if (!chart) return;
      chart.setOption({
        animationDuration: 240,
        color: [demoChartColors.server],
        aria: { show: true, description: description },
        tooltip: {
          trigger: 'axis',
          confine: true,
          axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(22,119,255,.08)' } },
          backgroundColor: '#ffffff',
          borderColor: '#dce3ed',
          borderWidth: 1,
          padding: [9, 12],
          textStyle: { color: '#243247', fontSize: 12 },
          extraCssText: 'box-shadow:0 8px 24px rgba(24,45,78,.12);border-radius:8px',
          formatter: function (params) {
            const point = Array.isArray(params) ? params[0] : params;
            const row = rows[point.dataIndex];
            return tooltipBox(point.axisValueLabel || point.axisValue, [
              '充值金额：' + formatCurrency(row.value),
              '占全部区服：' + formatRate(row.share)
            ]);
          }
        },
        grid: { left: 64, right: 24, top: 28, bottom: 42, containLabel: true },
        xAxis: {
          type: 'category',
          data: rows.map(function (row) { return row.name; }),
          axisTick: { alignWithLabel: true },
          axisLine: { lineStyle: { color: '#d7deea' } },
          axisLabel: { color: '#718096', interval: 0 }
        },
        yAxis: {
          type: 'value',
          min: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#718096',
            formatter: function (value) { return value >= 10000 ? '¥' + (value / 10000).toFixed(0) + '万' : formatCurrency(value); }
          },
          splitLine: { lineStyle: { color: '#edf1f6' } }
        },
        series: [{
          type: 'bar',
          name: '充值金额',
          barMaxWidth: 36,
          data: rows.map(function (row) {
            return { value: row.value, share: row.share, bucketFilter: bucketFilterFor(row, 'serverName') };
          }),
          itemStyle: { color: demoChartColors.server, borderRadius: [5, 5, 0, 0] },
          emphasis: { focus: 'none', itemStyle: { color: '#4091ff' } },
          label: {
            show: true,
            position: 'top',
            color: '#536174',
            fontSize: 11,
            formatter: function (params) { return formatCurrency(params.value); }
          }
        }]
      }, { notMerge: true });
      bindChartDetail(chart, 'serverRechargeBarChart');
    }

    function renderDemoCharts() {
      const keys = [
        'rechargeTrendChart', 'churnTrendChart', 'churnPaymentPieChart', 'rechargeTierPieChart',
        'rechargeCoveragePieChart', 'revisitPieChart', 'serverRechargeBarChart'
      ];
      if (!keys.some(function (key) { return nodes[key]; })) return;

      const rechargeRows = groupRecords(recordsForChart('rechargeTrendChart'), 'eventMonth', 'amount', [demoChartColors.recharge]);
      renderDemoLineChart('rechargeTrendChart', '充值金额趋势', rechargeRows, '充值金额', '¥', demoChartColors.recharge);

      const churnRows = groupRecords(recordsForChart('churnTrendChart'), 'eventMonth', 'count', [demoChartColors.churn]);
      renderDemoLineChart('churnTrendChart', '流失用户趋势', churnRows, '流失用户', '人', demoChartColors.churn);

      const churnTierRows = groupRecords(recordsForChart('churnPaymentPieChart'), 'paidTierLabel', 'count', demoChartColors.categories);
      churnTierRows.forEach(function (row) { row.index = churnTierRows.indexOf(row); });
      renderDemoPieChart('churnPaymentPieChart', '流失用户付费分类占比', churnTierRows, 'paidTierLabel', demoChartColors.categories);

      renderRechargeTierPie();

      const coverageRows = groupRecords(recordsForChart('rechargeCoveragePieChart'), 'addStatus', 'count', demoChartColors.coverage);
      coverageRows.forEach(function (row) { row.index = coverageRows.indexOf(row); });
      renderDemoPieChart('rechargeCoveragePieChart', '充值用户覆盖情况', coverageRows, 'addStatus', demoChartColors.coverage);

      const revisitRows = groupRecords(recordsForChart('revisitPieChart'), 'revisitStatus', 'count', demoChartColors.revisit);
      revisitRows.forEach(function (row) { row.index = revisitRows.indexOf(row); });
      renderDemoPieChart('revisitPieChart', '回访情况统计', revisitRows, 'revisitStatus', demoChartColors.revisit);

      renderServerRechargeBar();
    }

    let chartResizeScheduled = false;
    let chartResizeObserver = null;
    const chartContainerSizes = new WeakMap();
    function resizeDemoCharts() {
      if (chartResizeScheduled) return;
      chartResizeScheduled = true;
      window.requestAnimationFrame(function () {
        chartResizeScheduled = false;
        chartInstances.forEach(function (chart, key) {
          const node = nodes[key];
          if (!node) return;
          const rect = node.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) chart.resize();
        });
      });
    }

    function observeDemoChartSizes() {
      if (typeof window.ResizeObserver !== 'function') return;
      chartResizeObserver = new window.ResizeObserver(function (entries) {
        let hasVisibleSizeChange = false;
        entries.forEach(function (entry) {
          const width = entry.contentRect.width;
          const height = entry.contentRect.height;
          const previousSize = chartContainerSizes.get(entry.target);
          chartContainerSizes.set(entry.target, { width: width, height: height });
          if (width > 0 && height > 0 && (!previousSize
              || previousSize.width !== width || previousSize.height !== height)) {
            hasVisibleSizeChange = true;
          }
        });
        if (hasVisibleSizeChange) resizeDemoCharts();
      });
      chartInstances.forEach(function (chart, key) {
        const node = nodes[key];
        if (node) chartResizeObserver.observe(node);
      });
    }

    function renderCoverageDetails(people) {
      const employeeIds = new Set(people.map(function (person) { return person.id; }));
      const projectId = selectedProjectId();
      const rows = demoModel.projectTasks.filter(function (task) {
        return employeeIds.has(task.employeeId)
          && matchesPaidTier(task)
          && matchesDateRange(task.taskDate)
          && (!projectId || task.projectId === projectId);
      }).map(function (task) {
        return {
          task: task,
          roleDetails: task.roleDetails.filter(function (detail) {
            return detail.projectId === task.projectId;
          })
        };
      }).sort(function (a, b) {
        return a.task.projectName.localeCompare(b.task.projectName, 'zh-CN')
          || a.task.employeeName.localeCompare(b.task.employeeName, 'zh-CN')
          || a.task.userId.localeCompare(b.task.userId, 'zh-CN');
      });

      nodes.coverageDetailCount.textContent = '共 ' + formatCount(rows.length) + ' 条项目付费用户任务 · 日期 ' + currentDateScopeText();
      if (!rows.length) {
        nodes.coverageDetailRows.innerHTML = '<tr><td class="brc-coverage-detail-empty" colspan="5">当前筛选范围暂无项目付费用户任务</td></tr>';
        return;
      }

      nodes.coverageDetailRows.innerHTML = rows.map(function (row) {
        const task = row.task;
        const roleDetails = row.roleDetails;
        const servers = Array.from(new Set(roleDetails.map(function (detail) {
          return detail.serverName;
        }).filter(Boolean)));
        const cumulativeRecharge = roleDetails.reduce(function (total, detail) {
          return total + Number(detail.cumulativeRecharge || 0);
        }, 0);
        const lastLogin = roleDetails.reduce(function (latest, detail) {
          return detail.lastLogin && detail.lastLogin > latest ? detail.lastLogin : latest;
        }, '');
        const statusClass = task.status === 'yes'
          ? 'is-covered'
          : task.status === 'no'
            ? 'is-uncovered'
            : 'is-pending';

        const roleSummary = roleDetails.map(function (detail) {
          return '<div class="brc-user-meta">角色ID：' + escapeHtml(detail.roleId)
            + ' · 角色名：' + escapeHtml(detail.roleName)
            + ' · 区服：' + escapeHtml(detail.serverName) + '</div>';
        }).join('');

        return '<tr class="coverage-detail-row">'
          + '<td><strong>' + escapeHtml(task.projectName) + '</strong><div class="brc-user-meta">任务日期：' + escapeHtml(task.taskDate) + '</div></td>'
          + '<td><strong class="brc-user-primary">' + escapeHtml(task.userName)
          + '（' + escapeHtml(task.userId) + '）</strong><div class="brc-user-meta">账号：'
          + escapeHtml(task.account) + ' · 付费分类：' + escapeHtml(task.rating) + '（演示）</div></td>'
          + '<td><strong>' + escapeHtml(task.employeeName + '（' + task.team + '）') + '</strong>'
          + roleSummary + '<div class="brc-user-meta">区服：' + escapeHtml(servers.join('、')) + '</div></td>'
          + '<td>' + renderRecordFacts([['累计充值', formatCurrency(cumulativeRecharge)], ['最后登录', lastLogin]]) + '</td>'
          + '<td><span class="brc-status-pill ' + statusClass + '">'
          + escapeHtml(statusLabels[task.status]) + '</span><div class="brc-user-meta">' + escapeHtml(task.basis) + '</div></td>'
          + '</tr>';
      }).join('');
    }

    let activeDetailContext = null;

    function selectedDetailStatus() {
      if (!nodes.detailStatusFilter) return 'all';
      return ['all', 'yes', 'no', 'unknown'].includes(nodes.detailStatusFilter.value)
        ? nodes.detailStatusFilter.value
        : 'all';
    }

    function renderDetailContent() {
      if (!activeDetailContext) return;
      const context = activeDetailContext;
      const stats = context.stats;
      const filter = selectedDetailStatus();
      const statusText = filter === 'all' ? '全部状态' : statusLabels[filter];
      const tasks = context.tasks.filter(function (task) {
        return filter === 'all' || task.status === filter;
      });
      const projectScope = selectedProjectId()
        ? '项目筛选：' + projectNameFor(selectedProjectId()) + '。'
        : '项目筛选：全部项目。';
      const tierScope = selectedPaidTier()
        ? '付费分类：' + selectedPaidTier() + '。'
        : '付费分类：全部付费用户。';
      const rowRule = context.kind === 'project'
        ? '按员工 × 用户 × 项目任务列示；同项目多角色合并，好友状态按员工 × 用户判断。'
        : '按员工 × 用户任务列示；同员工多角色合并，跨员工的同一用户分别列出。';
      const summaryText = '应覆盖 ' + formatCount(stats.required)
        + ' 项 · 已覆盖 ' + formatCount(stats.covered)
        + ' · 确认未覆盖 ' + formatCount(stats.uncovered)
        + ' · 待核实 ' + formatCount(stats.unknown)
        + ' · 覆盖率 ' + formatRate(stats.rate);
      nodes.detailMeta.textContent = projectScope + tierScope + '日期范围：' + currentDateScopeText() + '，按覆盖任务日期筛选。' + rowRule
        + '当前明细状态：' + statusText + '，显示 ' + formatCount(tasks.length)
        + ' 条；状态筛选不改变应覆盖分母。';
      if (nodes.detailSummary) nodes.detailSummary.textContent = summaryText;

      if (!tasks.length) {
        nodes.detailRows.innerHTML = '<tr><td class="brc-table-empty" colspan="6">当前状态下暂无付费用户任务</td></tr>';
        return;
      }

      nodes.detailRows.innerHTML = tasks.map(function (task) {
        const statusClass = task.status === 'yes'
          ? 'is-covered'
          : task.status === 'no'
            ? 'is-uncovered'
            : 'is-pending';
        const mergedRoles = task.roleNames.length > 1
          ? '<div class="brc-user-meta">' + formatCount(task.roleNames.length) + ' 个演示角色已合并</div>'
          : '';
        const projectIds = task.projectId
          ? [task.projectId]
          : selectedProjectId()
            ? [selectedProjectId()]
            : task.projectIds;
        const projectNames = projectIds.map(projectNameFor).join('、');
        const roleDetails = task.roleDetails.filter(function (detail) {
          return projectIds.includes(detail.projectId);
        });
        const roleMeta = roleDetails.map(function (detail) {
          const facts = [
            ['项目', detail.projectName],
            ['角色ID', detail.roleId],
            ['角色名', detail.roleName],
            ['区服', detail.serverName],
            ['演示累计充值', detail.cumulativeRecharge == null || detail.cumulativeRecharge === ''
              ? ''
              : '¥' + formatCount(detail.cumulativeRecharge)],
            ['演示最后登录', detail.lastLogin]
          ].filter(function (fact) {
            return fact[1] !== null && fact[1] !== undefined && fact[1] !== '';
          }).map(function (fact) {
            return '<span class="brc-user-fact"><span class="brc-user-label">'
              + escapeHtml(fact[0]) + '：</span>' + escapeHtml(fact[1]) + '</span>';
          }).join(' · ');
          return facts ? '<div class="brc-user-meta">' + facts + '</div>' : '';
        }).join('');
        return '<tr>'
          + '<td><strong class="brc-user-primary">' + escapeHtml(task.userName) + '（' + escapeHtml(task.userId) + '）</strong>'
          + mergedRoles + roleMeta + '</td>'
          + '<td><strong>' + escapeHtml(task.employeeName) + '</strong><div>' + escapeHtml(task.team) + '</div></td>'
          + '<td><strong>' + escapeHtml(task.rating) + '（演示）</strong><div>' + escapeHtml(task.ratingBasis) + '</div></td>'
          + '<td>' + escapeHtml(projectNames) + '<div class="brc-user-meta">任务日期：' + escapeHtml(task.taskDate) + '</div></td>'
          + '<td><span class="brc-status-pill ' + statusClass + '">' + escapeHtml(statusLabels[task.status]) + '</span></td>'
          + '<td>' + escapeHtml(task.basis) + '</td>'
          + '</tr>';
      }).join('');
    }

    function showDialog(dialog) {
      if (!dialog) return;
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.hidden = false;
        dialog.setAttribute('open', '');
      }
    }

    function openDetail(ranking, initialStatus) {
      const kind = ranking.kind === 'project'
        ? '项目'
        : ranking.kind === 'group'
          ? '分组'
          : ranking.kind === 'staff'
            ? '员工'
            : '';
      const scopeTitle = ranking.kind === 'scope'
        ? (selectedPaidTier() || '全部付费用户') + '任务明细'
        : kind + '：' + ranking.name + ' · 付费用户任务明细';
      nodes.detailTitle.textContent = scopeTitle;
      activeDetailContext = {
        kind: ranking.kind,
        tasks: ranking.tasks.slice().sort(function (a, b) {
          return a.employeeName.localeCompare(b.employeeName, 'zh-CN')
            || a.userId.localeCompare(b.userId, 'zh-CN')
            || (a.projectName || '').localeCompare(b.projectName || '', 'zh-CN');
        }),
        stats: ranking.stats
      };
      if (nodes.detailStatusFilter) {
        nodes.detailStatusFilter.value = ['all', 'yes', 'no', 'unknown'].includes(initialStatus)
          ? initialStatus
          : 'all';
      }
      renderDetailContent();
      showDialog(nodes.detailDialog);
    }

    function openStatusDetails(status) {
      const tasks = globalTasksFor(scopedEmployees());
      openDetail({
        kind: 'scope',
        name: '当前筛选范围',
        tasks: tasks,
        stats: summarize(tasks)
      }, status);
    }

    function openRankFromEvent(event) {
      const target = event.target.closest('[data-rank-index]');
      if (!target) return;
      const index = Number(target.dataset.rankIndex);
      if (Number.isInteger(index) && currentRankings[index]) openDetail(currentRankings[index]);
    }

    function closeDetail() {
      if (typeof nodes.detailDialog.close === 'function' && nodes.detailDialog.open) {
        nodes.detailDialog.close();
      } else {
        nodes.detailDialog.hidden = true;
        nodes.detailDialog.removeAttribute('open');
      }
    }

    function openProjectDetails() {
      renderCoverageDetails(scopedEmployees());
      showDialog(nodes.projectDetailDialog);
    }

    function closeProjectDetails() {
      if (!nodes.projectDetailDialog) return;
      if (typeof nodes.projectDetailDialog.close === 'function' && nodes.projectDetailDialog.open) {
        nodes.projectDetailDialog.close();
      } else {
        nodes.projectDetailDialog.hidden = true;
        nodes.projectDetailDialog.removeAttribute('open');
      }
    }

    function closeChartDetail() {
      if (!nodes.chartDetailDialog) return;
      if (typeof nodes.chartDetailDialog.close === 'function' && nodes.chartDetailDialog.open) {
        nodes.chartDetailDialog.close();
      } else {
        nodes.chartDetailDialog.hidden = true;
        nodes.chartDetailDialog.removeAttribute('open');
      }
    }

    function render() {
      const people = scopedEmployees();
      const globalTasks = globalTasksFor(people);

      currentRankings = buildRankings(people);
      const projectNote = dimension === 'project'
        ? selectedProjectId()
          ? ' 当前项目范围员工 × 用户任务 ' + formatCount(globalTasks.length) + '。'
          : ' 当前筛选范围全局员工 × 用户任务 ' + formatCount(globalTasks.length)
            + '；项目排行按员工 × 用户 × 项目分别计数，跨项目重复，项目行合计可能大于全局任务。'
        : '';
      const projectSelection = selectedProjectId()
        ? ' 项目归属筛选：' + projectNameFor(selectedProjectId()) + '。'
        : ' 项目归属筛选：全部项目。';
      const tierSelection = selectedPaidTier()
        ? ' 付费分类筛选：' + selectedPaidTier() + '。'
        : ' 付费分类筛选：全部付费用户。';
      nodes.dateRangeHint.textContent = dateRangeIsValid()
        ? '含起止日期 · 支付按支付时间，回访按任务日期，流失按流失日期，覆盖按任务日期。当前：' + currentDateScopeText()
        : '日期区间无效：开始日期不能晚于结束日期，当前结果为空。';
      nodes.dateRangeHint.classList.toggle('is-error', !dateRangeIsValid());
      nodes.sourceStatus.textContent = '演示数据 · 图表由独立底层记录汇总；覆盖任务按员工 × 用户统计，待核实不计入确认未覆盖。'
        + tierSelection + projectSelection + projectNote;
      nodes.sourceStatus.setAttribute('role', 'status');
      renderSummary(globalTasks, people);
      renderRankingHead();
      renderRankingRows();
      renderCoverageChart();
      renderCoverageDetails(people);
      renderDemoCharts();
      if (activeChartDetail) renderChartDetailContent();
    }

    fillProjectFilter();
    fillTeamFilter();
    nodes.dimensionTabs.querySelectorAll('button[data-dimension]').forEach(function (button) {
      const isActive = button.dataset.dimension === dimension;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    nodes.projectFilter.addEventListener('change', render);
    if (nodes.paidTierFilter) nodes.paidTierFilter.addEventListener('change', render);
    nodes.teamFilter.addEventListener('change', render);
    nodes.staffSearch.addEventListener('input', render);
    if (nodes.rechargeTierSelect) nodes.rechargeTierSelect.addEventListener('change', render);
    nodes.dateStart.addEventListener('change', render);
    nodes.dateEnd.addEventListener('change', render);
    nodes.resetDateRange.addEventListener('click', function () {
      nodes.dateStart.value = '2026-04-01';
      nodes.dateEnd.value = '2026-09-30';
      render();
    });
    nodes.dimensionTabs.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-dimension]');
      if (!button || !['staff', 'group', 'project'].includes(button.dataset.dimension)) return;
      dimension = button.dataset.dimension;
      nodes.dimensionTabs.querySelectorAll('button[data-dimension]').forEach(function (tab) {
        const isActive = tab === button;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
      });
      render();
    });
    nodes.rankingRows.addEventListener('click', openRankFromEvent);
    if (nodes.coverageChart) nodes.coverageChart.addEventListener('click', openRankFromEvent);
    nodes.summaryCards.addEventListener('click', function (event) {
      const target = event.target.closest('[data-detail-status]');
      if (!target || !['yes', 'no', 'unknown'].includes(target.dataset.detailStatus)) return;
      openStatusDetails(target.dataset.detailStatus);
    });
    nodes.rankingRows.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openRankFromEvent(event);
    });
    nodes.closeDetail.addEventListener('click', closeDetail);
    if (nodes.detailStatusFilter) nodes.detailStatusFilter.addEventListener('change', renderDetailContent);
    nodes.detailDialog.addEventListener('click', function (event) {
      if (event.target === nodes.detailDialog) closeDetail();
    });
    if (nodes.openProjectDetails) nodes.openProjectDetails.addEventListener('click', openProjectDetails);
    if (nodes.closeProjectDetail) nodes.closeProjectDetail.addEventListener('click', closeProjectDetails);
    if (nodes.projectDetailDialog) nodes.projectDetailDialog.addEventListener('click', function (event) {
      if (event.target === nodes.projectDetailDialog) closeProjectDetails();
    });
    nodes.chartDetailButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        openChartDetail(button.dataset.chartDetail);
      });
    });
    if (nodes.closeChartDetail) nodes.closeChartDetail.addEventListener('click', closeChartDetail);
    nodes.chartDetailPageSize.addEventListener('change', function () {
      if (activeChartDetail) activeChartDetail.page = 1;
      renderChartDetailContent();
    });
    nodes.chartDetailFirst.addEventListener('click', function () {
      if (activeChartDetail) activeChartDetail.page = 1;
      renderChartDetailContent();
    });
    nodes.chartDetailPrevious.addEventListener('click', function () {
      if (activeChartDetail) activeChartDetail.page = Math.max(1, activeChartDetail.page - 1);
      renderChartDetailContent();
    });
    nodes.chartDetailNext.addEventListener('click', function () {
      if (activeChartDetail) activeChartDetail.page += 1;
      renderChartDetailContent();
    });
    nodes.chartDetailLast.addEventListener('click', function () {
      if (activeChartDetail) {
        const count = chartDetailRecords(activeChartDetail).length;
        activeChartDetail.page = Math.max(1, Math.ceil(count / Number(nodes.chartDetailPageSize.value)));
      }
      renderChartDetailContent();
    });
    if (nodes.chartDetailDialog) {
      nodes.chartDetailDialog.addEventListener('click', function (event) {
        if (event.target === nodes.chartDetailDialog) closeChartDetail();
      });
      nodes.chartDetailDialog.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        closeChartDetail();
      });
    }
    window.addEventListener('resize', resizeDemoCharts);
    observeDemoChartSizes();
    render();

    return {
      refresh: render,
      getMetrics: function () {
        const people = scopedEmployees();
        const globalTasks = globalTasksFor(people);
        const dimensionTasks = tasksForDimension(people, globalTasks);
        return Object.assign(summarize(globalTasks), {
          privateUsers: privatePoolUserCount(people, selectedProjectId()),
          globalTaskCount: globalTasks.length,
          dimensionTaskCount: dimensionTasks.length,
          paidUsers: uniqueUserCount(globalTasks),
          bigRUsers: uniqueUserCount(globalTasks.filter(function (task) { return task.paidTier === '大R'; }))
        });
      }
    };
  }

  window.BigRCoveragePrototype = {
    mount: mount,
    demoData: demoModel
  };

  if (document.querySelector('#summaryCards')) mount(document);
})(window, document);
