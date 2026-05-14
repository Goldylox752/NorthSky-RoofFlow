import SwiftUI
import ClerkKit

struct ContentView: View {
  @Environment(Clerk.self) private var clerk

  var body: some View {
    VStack {
      if let user = clerk.user {
        Text("Hello, \(user.id)")
      } else {
        Text("You are signed out")
      }
    }
  }
}