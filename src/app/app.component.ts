import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'todoapp';
  readonly APIUrl = "http://localhost:5038/api/todoapp/";
  newNote: string = ''; // Binding for the input field
  updatedDescription: string = ''; // Define updatedDescription property
  searchTerm: string = ''; // Define searchTerm property

  notes: any = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.refreshNotes();
  }

  refreshNotes() {
    this.http.get(this.APIUrl + 'GetNotes').subscribe((data: any) => {
      this.notes = data;
    });
  }

  addNotes() {
    const formData = new FormData();
    formData.append("newNote", this.newNote); // Using ngModel binding for the input value
    this.http.post(this.APIUrl + 'AddNotes', formData).subscribe((data: any) => {
      alert(data);
      this.refreshNotes();
      this.newNote = ''; // Clearing input field after adding note
    });
  }

  deleteNotes(id: any) {
    console.log(id);
    this.http.delete(this.APIUrl + 'DeleteNote/' + id).subscribe((data: any) => {
      alert(data);
      this.refreshNotes();
    });
  }

  updateNotes(id: any, newDescription: string) { // Define updateNotes method
    const formData = new FormData();
    console.log(newDescription);
    formData.append("description", newDescription);
    this.http.put(this.APIUrl + 'UpdateNote/' + id, formData).subscribe((data: any) => {
      alert(data.message);
      this.refreshNotes();
    });
}

searchNotes() {
    this.http.get(this.APIUrl + 'SearchNotes', { params: { term: this.searchTerm } }).subscribe((data: any) => {
        this.notes = data;
    });
}
}