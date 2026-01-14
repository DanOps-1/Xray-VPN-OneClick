# Tasks: 流量配额管理与 UI 增强

**Input**: Design documents from `/specs/010-traffic-quota-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 包含单元测试任务（项目使用 Vitest）

**Organization**: 任务按用户故事分组，支持独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3, US4）
- 描述中包含确切文件路径

---

## Phase 1: Setup (基础设施)

**Purpose**: 类型定义和工具函数

- [x] T001 [P] 创建流量配额类型定义 in src/types/quota.ts
- [x] T002 [P] 创建流量格式化工具 in src/utils/traffic-formatter.ts
- [x] T003 [P] 创建常量定义（配额路径、API端口等）in src/constants/quota.ts

---

## Phase 2: Foundational (核心服务)

**Purpose**: 所有用户故事依赖的核心服务

**⚠️ CRITICAL**: 必须完成此阶段才能开始用户故事实现

- [x] T004 实现 TrafficManager 服务 in src/services/traffic-manager.ts
- [x] T005 实现 QuotaManager 服务 in src/services/quota-manager.ts
- [x] T006 [P] 创建 TrafficManager 单元测试 in tests/unit/services/traffic-manager.test.ts
- [x] T007 [P] 创建 QuotaManager 单元测试 in tests/unit/services/quota-manager.test.ts
- [x] T008 [P] 创建 traffic-formatter 单元测试 in tests/unit/utils/traffic-formatter.test.ts

**Checkpoint**: 核心服务就绪，可开始用户故事实现

---

## Phase 3: User Story 1 - 为用户分配流量配额 (Priority: P1) 🎯 MVP

**Goal**: 管理员可以为每个用户设置和修改流量配额

**Independent Test**: 创建用户并设置流量配额，验证配额正确保存和显示

### Implementation for User Story 1

- [x] T009 [US1] 扩展 User 类型添加配额字段 in src/types/user.ts
- [x] T010 [US1] 实现配额设置命令 in src/commands/quota.ts
- [x] T011 [US1] 修改用户创建流程集成配额设置 in src/commands/user.ts
- [x] T012 [US1] 添加配额管理子菜单 in src/commands/interactive.ts
- [x] T013 [US1] 实现配额输入验证（支持 MB/GB/TB 单位）in src/commands/quota.ts

**Checkpoint**: 用户故事 1 完成，可独立测试配额分配功能

---

## Phase 4: User Story 2 - 查看用户流量使用情况 (Priority: P1)

**Goal**: 管理员可以查看每个用户的流量使用情况和剩余配额

**Independent Test**: 查看用户列表，验证流量统计数据正确显示

### Implementation for User Story 2

- [x] T014 [US2] 修改用户列表显示添加流量信息 in src/commands/user.ts
- [x] T015 [US2] 实现流量详情查看命令 in src/commands/quota.ts
- [ ] T016 [US2] 添加流量使用进度条组件 in src/components/progress-bar.ts
- [x] T017 [US2] 集成 Xray Stats API 查询 in src/services/traffic-manager.ts

**Checkpoint**: 用户故事 2 完成，可独立测试流量查看功能

---

## Phase 5: User Story 3 - 改进的服务管理界面 (Priority: P2)

**Goal**: 提供更美观、功能更完善的管理界面

**Independent Test**: 启动 CLI 工具，验证仪表盘显示服务状态、用户统计、流量概览

### Implementation for User Story 3

- [x] T018 [US3] 增强仪表盘添加流量概览 in src/components/dashboard-widget.ts
- [x] T019 [US3] 添加用户统计摘要显示 in src/components/dashboard-widget.ts
- [x] T020 [US3] 优化菜单结构和导航 in src/commands/interactive.ts

**Checkpoint**: 用户故事 3 完成，界面改进可独立验证

---

## Phase 6: User Story 4 - 流量配额预警与自动禁用 (Priority: P3)

**Goal**: 流量接近或超过配额时显示预警，超限自动禁用用户

**Independent Test**: 模拟用户流量达到阈值，验证预警显示和自动禁用功能

### Implementation for User Story 4

- [x] T021 [US4] 实现 QuotaEnforcer 服务 in src/services/quota-enforcer.ts
- [x] T022 [US4] 添加警告级别计算逻辑 in src/services/quota-manager.ts
- [x] T023 [US4] 实现用户列表颜色标记（黄色警告/红色超额）in src/commands/user.ts
- [x] T024 [US4] 实现超限自动禁用功能 in src/services/quota-enforcer.ts
- [x] T025 [US4] 实现手动重新启用用户功能 in src/commands/quota.ts
- [x] T026 [US4] 实现流量重置功能 in src/commands/quota.ts

**Checkpoint**: 用户故事 4 完成，预警和自动禁用功能可独立验证

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和完善

- [x] T027 [P] 添加边界情况处理（无效配额值、服务未运行等）in src/services/quota-manager.ts
- [x] T028 [P] 添加 Xray Stats 配置检测和提示 in src/services/traffic-manager.ts
- [x] T029 [P] 创建集成测试 in tests/integration/quota-flow.test.ts
- [x] T030 运行 lint 和测试确保代码质量
- [x] T031 更新 i18n 翻译文件 in src/config/i18n.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Phase 1 完成，阻塞所有用户故事
- **User Stories (Phase 3-6)**: 依赖 Phase 2 完成
  - US1 和 US2 可并行（都是 P1 优先级）
  - US3 依赖 US2（需要流量数据显示）
  - US4 依赖 US1 和 US2（需要配额和流量数据）
- **Polish (Phase 7)**: 依赖所有用户故事完成

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├──────────────┬──────────────┐
    ▼              ▼              │
Phase 3 (US1)  Phase 4 (US2)     │
    │              │              │
    └──────┬───────┘              │
           ▼                      │
       Phase 5 (US3) ◄────────────┘
           │
           ▼
       Phase 6 (US4)
           │
           ▼
       Phase 7 (Polish)
```

### Parallel Opportunities

**Phase 1 内部并行**:
- T001, T002, T003 可同时执行

**Phase 2 内部并行**:
- T006, T007, T008 (测试) 可同时执行

**Phase 3 和 Phase 4 可并行**:
- US1 和 US2 无直接依赖，可由不同开发者同时进行

---

## Parallel Example: Phase 1

```bash
# 同时启动所有 Setup 任务:
Task: "创建流量配额类型定义 in src/types/quota.ts"
Task: "创建流量格式化工具 in src/utils/traffic-formatter.ts"
Task: "创建常量定义 in src/constants/quota.ts"
```

## Parallel Example: Phase 2 Tests

```bash
# 同时启动所有单元测试:
Task: "创建 TrafficManager 单元测试 in tests/unit/traffic-manager.test.ts"
Task: "创建 QuotaManager 单元测试 in tests/unit/quota-manager.test.ts"
Task: "创建 traffic-formatter 单元测试 in tests/unit/traffic-formatter.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational
3. 完成 Phase 3: User Story 1 (配额分配)
4. 完成 Phase 4: User Story 2 (流量查看)
5. **STOP and VALIDATE**: 测试核心功能
6. 可部署/演示 MVP

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. 添加 US1 → 测试 → 部署 (可分配配额)
3. 添加 US2 → 测试 → 部署 (可查看流量)
4. 添加 US3 → 测试 → 部署 (界面改进)
5. 添加 US4 → 测试 → 部署 (预警和自动禁用)

---

## Summary

| Phase | 任务数 | 用户故事 |
|-------|--------|----------|
| Phase 1: Setup | 3 | - |
| Phase 2: Foundational | 5 | - |
| Phase 3: US1 | 5 | 为用户分配流量配额 |
| Phase 4: US2 | 4 | 查看用户流量使用情况 |
| Phase 5: US3 | 3 | 改进的服务管理界面 |
| Phase 6: US4 | 6 | 流量配额预警与自动禁用 |
| Phase 7: Polish | 5 | - |
| **Total** | **31** | **4 个用户故事** |

---

## Notes

- [P] 任务 = 不同文件，无依赖，可并行
- [Story] 标签将任务映射到特定用户故事
- 每个用户故事应可独立完成和测试
- 每个任务或逻辑组完成后提交
- 在任何检查点停止以独立验证故事
