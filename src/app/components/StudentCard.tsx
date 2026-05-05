import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, User, GraduationCap, Mail, Phone, AlertCircle, Heart, Users } from 'lucide-react';

interface Student {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  email: string;
  allergies?: string[];
  medicalConditions?: string[];
  createdAt: any;
}

interface ParentInfo {
  name: string;
  email: string;
  phone: string;
}

export function StudentCard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [parentMap, setParentMap] = useState<Record<string, ParentInfo>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];

      // Load all parent users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const parents = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((user: any) => user.role === 'parent');

      // Create a map: studentId -> parentInfo
      const parentsMap: Record<string, ParentInfo> = {};

      parents.forEach((parent: any) => {
        if (parent.studentIds && Array.isArray(parent.studentIds)) {
          parent.studentIds.forEach((studentId: string) => {
            parentsMap[studentId] = {
              name: parent.name || 'Unknown',
              email: parent.email || 'Not provided',
              phone: parent.phone || 'Not provided'
            };
          });
        }
      });

      setStudents(studentsData);
      setParentMap(parentsMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-slate-900">Student Cards</h1>
        <p className="mt-2 text-slate-600">
          View complete student information and medical details
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, student ID, grade, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-2 focus:border-ndkc-green"
            />
          </div>
        </CardContent>
      </Card>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-slate-200 bg-white shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-slate-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">
              {searchTerm ? 'No students found matching your search' : 'No students registered yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="border-slate-200 bg-white shadow-sm hover-lift transition-all duration-200">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-ndkc-green/5 to-emerald-50/30 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ndkc-green to-emerald-600 shadow-lg shadow-emerald-500/30">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900">{student.name}</CardTitle>
                      <p className="text-sm text-slate-500 mt-0.5">ID: {student.studentId}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                {/* Grade */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Grade / Year Level</p>
                    <p className="text-sm font-medium text-slate-900">{student.grade}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Student Email</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{student.email}</p>
                  </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700">Parent / Guardian</p>
                    </div>
                  </div>

                  {parentMap[student.id] ? (
                    <div className="ml-12 space-y-2">
                      {/* Parent Name */}
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="text-sm font-medium text-slate-900">{parentMap[student.id].name}</p>
                      </div>

                      {/* Parent Email */}
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-900 truncate">{parentMap[student.id].email}</p>
                      </div>

                      {/* Parent Contact */}
                      <div>
                        <p className="text-xs text-slate-500">Contact Number</p>
                        <p className="text-sm font-medium text-slate-900">{parentMap[student.id].phone}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-12">
                      <p className="text-sm text-slate-400 italic">No parent linked</p>
                    </div>
                  )}
                </div>

                {/* Allergies */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <p className="text-xs font-semibold text-slate-700">Allergies</p>
                  </div>
                  {student.allergies && student.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {student.allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 text-xs"
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No known allergies</p>
                  )}
                </div>

                {/* Medical Conditions */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-start gap-2 mb-2">
                    <Heart className="h-4 w-4 text-rose-500 mt-0.5" />
                    <p className="text-xs font-semibold text-slate-700">Medical Conditions</p>
                  </div>
                  {student.medicalConditions && student.medicalConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {student.medicalConditions.map((condition, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-rose-50 text-rose-700 border-rose-200 text-xs"
                        >
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No known medical conditions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
