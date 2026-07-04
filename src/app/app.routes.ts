import { Routes } from '@angular/router';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { StudentDashboard } from './components/student/student-dashboard/student-dashboard';
import { Home } from './pages/home/home';
import { authGuard } from './guards/auth-guard';
import { FormationManagement } from './components/admin/formation-management/formation-management';
import { WaveManagement } from './components/admin/wave-management/wave-management';
import { AdminOverview } from './components/admin/admin-overview/admin-overview';
import { Candidatures } from './components/admin/candidatures/candidatures';

export const routes: Routes = [
  {path: '', component : Home},
  {path: 'admin/dashboard' , component : AdminDashboard, canActivate : [authGuard],

    children: [
      {path : '' , component : AdminOverview},
      { path: 'formations', component: FormationManagement },
      { path: 'waves', component: WaveManagement },
      {path : 'candidatures', component:Candidatures}
    ]
  },
  {path: 'student/dashboard', component : StudentDashboard, canActivate:[authGuard]},

];
