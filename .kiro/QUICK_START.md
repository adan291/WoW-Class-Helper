# Quick Start Guide - WoW AI Class Helper

## 📍 You Are Here

You have a fully configured Kiro workspace with specifications, steering guidelines, and automation hooks.

## 🎯 What's Available

### 📋 Specifications
Located in `.kiro/specs/`

- **wow-class-helper.md** - What the app does (8 acceptance criteria)
- **wow-class-helper-design.md** - How it's built (10 correctness properties)

### 🎨 Steering Guidelines
Located in `.kiro/steering/`

- **project-standards.md** - Code style, conventions, best practices
- **gemini-api-guidelines.md** - Gemini API integration guide
- **README.md** - How steering works

### 🔧 Automation Hooks
Located in `.kiro/hooks/`

- **on-file-save-lint.md** - Validates TypeScript on save
- **on-gemini-service-update.md** - Validates Gemini service changes
- **on-component-creation.md** - Scaffolds new components
- **on-constants-update.md** - Validates game data
- **on-build-prepare.md** - Pre-build checks
- **on-types-update.md** - Type consistency checks

## 🚀 Getting Started

### Step 1: Understand the Project
```
Read: .kiro/specs/wow-class-helper.md
Time: 5 minutes
Goal: Understand what users can do
```

### Step 2: Learn the Architecture
```
Read: .kiro/specs/wow-class-helper-design.md
Time: 10 minutes
Goal: Understand how it's built
```

### Step 3: Review Code Standards
```
Read: .kiro/steering/project-standards.md
Time: 15 minutes
Goal: Know how to write code
```

### Step 4: Start Coding
```
Follow: project-standards.md patterns
Use: Existing components as examples
Validate: Hooks will check your code
```

## 📚 Quick Reference

| I want to... | Read this |
|---|---|
| Understand requirements | `specs/wow-class-helper.md` |
| Understand architecture | `specs/wow-class-helper-design.md` |
| Write a component | `steering/project-standards.md` → React Components |
| Integrate with Gemini | `steering/gemini-api-guidelines.md` |
| Style something | `steering/project-standards.md` → UI/UX Standards |
| Handle errors | `steering/project-standards.md` → Error Handling |
| Optimize performance | `steering/project-standards.md` → Performance |
| Ensure security | `steering/project-standards.md` → Security |
| Write tests | `steering/project-standards.md` → Testing |

## 🔍 Key Concepts

### Acceptance Criteria (AC)
What users should be able to do. Found in `specs/wow-class-helper.md`

Example: "Users can filter classes by role (Tank, Healer, Damage)"

### Correctness Properties (CP)
How the system should behave correctly. Found in `specs/wow-class-helper-design.md`

Example: "Selected specialization must belong to selected class"

### Steering Guidelines
How to implement features correctly. Found in `steering/`

Example: "Use React.FC for component typing"

### Hooks
Automated validation of your code. Found in `.kiro/hooks/`

Example: "Validate TypeScript on file save"

## 💡 Common Tasks

### Adding a New Feature
1. Check if it's in `specs/wow-class-helper.md`
2. Review related correctness properties in `specs/wow-class-helper-design.md`
3. Follow patterns in `steering/project-standards.md`
4. Write code
5. Hooks validate automatically

### Fixing a Bug
1. Check correctness properties in `specs/wow-class-helper-design.md`
2. Understand what should happen
3. Review error handling in `steering/project-standards.md`
4. Fix the code
5. Hooks validate automatically

### Integrating with Gemini API
1. Read `steering/gemini-api-guidelines.md`
2. Follow prompt engineering best practices
3. Implement error handling
4. Test with mock responses
5. Hook validates on save

### Styling a Component
1. Check design system in `steering/project-standards.md`
2. Use Tailwind classes
3. Ensure responsive design
4. Check accessibility
5. Validate contrast ratios

## 🎓 Learning Path

### For New Developers
1. Read `specs/wow-class-helper.md` (5 min)
2. Read `specs/wow-class-helper-design.md` (10 min)
3. Read `steering/project-standards.md` (15 min)
4. Look at existing components
5. Start with small features

### For API Integration
1. Read `steering/gemini-api-guidelines.md` (10 min)
2. Review `services/geminiService.ts`
3. Understand prompt structure
4. Test with mock responses
5. Implement new guide types

### For Performance Optimization
1. Read performance section in `steering/project-standards.md`
2. Review optimization techniques in `specs/wow-class-helper-design.md`
3. Profile current implementation
4. Identify bottlenecks
5. Implement optimizations

## 🔐 Important Security Notes

From `steering/project-standards.md`:
- Never commit `.env.local`
- API key injected at build time
- Sanitize user input
- Escape HTML in output
- Validate URLs before API injection

## 📊 Project Stats

- **13 WoW Classes** with 2-4 specs each
- **24 Dungeons** across 4 expansions
- **5 Guide Types**: Overview, Builds, Rotations, Addons, Dungeons
- **3 User Roles**: User, Master, Admin
- **8 Acceptance Criteria** (all features)
- **10 Correctness Properties** (all behaviors)
- **6 Automation Hooks** (all validations)

## 🎯 Success Criteria

Your implementation is successful when:
- ✅ All acceptance criteria are met
- ✅ All correctness properties hold true
- ✅ Code follows steering guidelines
- ✅ Hooks pass validation
- ✅ Tests pass
- ✅ Performance targets met
- ✅ Security best practices followed

## 📞 Need Help?

### Understanding Requirements
→ Check `specs/wow-class-helper.md`

### Understanding Architecture
→ Check `specs/wow-class-helper-design.md`

### Code Style Questions
→ Check `steering/project-standards.md`

### API Integration Questions
→ Check `steering/gemini-api-guidelines.md`

### Automation Questions
→ Check `.kiro/hooks/` files

## 🚦 Next Steps

1. **Read** the specifications (15 minutes)
2. **Review** the steering guidelines (20 minutes)
3. **Explore** the existing code
4. **Start** implementing features
5. **Let hooks** validate your work

---

**Ready to code?** Start with `specs/wow-class-helper.md` to understand what you're building!
